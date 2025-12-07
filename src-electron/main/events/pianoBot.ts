import { BrowserWindow, dialog, globalShortcut, ipcMain } from "electron";
import { keyboard, Key } from "@nut-tree-fork/nut-js";
import { CharToKeyCode, isCharAlwaysHigh, isNumberChar } from "../virtualdictionary";

// Disable autoDelayMs for faster key presses
keyboard.config.autoDelayMs = 0;
import fs from "node:fs";

interface NoteInfo {
    isHighNote: boolean;
    note: Key | null;
    noteChar: string;
}

// Event types based on VirtualPiano semantics
type PianoEvent =
    | { type: "simultaneous"; notes: NoteInfo[] }           // [asdf] - all at once
    | { type: "fastSequence"; notes: NoteInfo[] }           // [a s d f] - fastest possible speed
    | { type: "single"; note: NoteInfo }                    // Single note (no space before)
    | { type: "shortPause" }                                // Space between notes (a s d)
    | { type: "pause"; multiplier: number }                 // | character(s)
    | { type: "extendedPause" }                             // Paragraph break (newline)

class PianoBot {
    private static instance: PianoBot;
    private constructor() {}

    private mainWindow: BrowserWindow;

    // Main Data
    private version: string = "1.0.1";
    private state: "stopped" | "paused" | "running" = "stopped";
    private playtime: string = "00:00:00";
    private estimatedDuration: string = "00:00:00";
    private noteCount: number = 0;
    private currentNoteIndex: number = 0;
    private notes: string = "";
    private parsedEvents: PianoEvent[] = [];
    private isLoop: boolean = false;

    private error: string = "";

    // Settings Data
    private startHotkey: string = "F2";
    private stopHotkey: string = "F4";
    private pauseHotkey: string = "F3";
    private bpm: number = 135;

    public static getInstance(): PianoBot {
        if (!PianoBot.instance) {
            PianoBot.instance = new PianoBot();
        }

        return PianoBot.instance;
    }

    public init(mainWindow: BrowserWindow) {
        ipcMain.on("startPianoBot", () => this.startPianoBot());
        ipcMain.on("pausePianoBot", () => this.pausePianoBot());
        ipcMain.on("stopPianoBot", () => this.stopPianoBot());
        ipcMain.on("loadPianoBot", () => this.loadPianoBot());
        ipcMain.on("savePianoBot", () => this.savePianoBot());

        ipcMain.on("requestSync", () => this.requestSync());

        // Global shortcut
        globalShortcut.register("F2", () => this.startPianoBot());
        globalShortcut.register("F3", () => this.pausePianoBot());
        globalShortcut.register("F4", () => this.stopPianoBot());

        // Sync Data from renderer
        ipcMain.on("syncData", (_event, data) => {
            if (data.notes !== undefined) {
                this.notes = data.notes;
                this.parseNotes();
            }
            if (data.isLoop !== undefined) this.isLoop = data.isLoop;
            if (data.bpm !== undefined) {
                this.bpm = data.bpm;
                // Recalculate duration when BPM changes
                this.calculateEstimatedDuration();
            }
            // Send updated data back to renderer
            this.sendSync();
        });

        this.mainWindow = mainWindow;
    }

    private charToNoteInfo(char: string): NoteInfo {
        let isHighNote = char === char.toUpperCase();
        let noteChar = char;

        const isAlwaysHigh = isCharAlwaysHigh(char);
        if (isAlwaysHigh) {
            isHighNote = true;
        }

        const isNumber = isNumberChar(char);
        if (isNumber) {
            isHighNote = false;
        }

        if (isHighNote) {
            noteChar = char.toLowerCase();
        }

        return {
            isHighNote,
            note: CharToKeyCode(noteChar),
            noteChar,
        };
    }

    private isNoteChar(char: string): boolean {
        return /[a-zA-Z0-9!@#$%^&*()]/.test(char);
    }

    public parseNotes() {
        const events: PianoEvent[] = [];
        let isError = false;
        let errorMessage = "";

        // Split by paragraphs (double newlines = extended pause)
        const paragraphs = this.notes.split(/\n\s*\n/);

        for (let p = 0; p < paragraphs.length; p++) {
            const paragraph = paragraphs[p];

            // Add extended pause between paragraphs (not before first)
            if (p > 0) {
                events.push({ type: "extendedPause" });
            }

            let i = 0;
            let lastWasNote = false;

            while (i < paragraph.length) {
                const char = paragraph[i];

                // Handle brackets [ ] or { } for multi-notes
                if (char === "[" || char === "{") {
                    const closeBracket = char === "[" ? "]" : "}";
                    const startIdx = i + 1;
                    const endIdx = paragraph.indexOf(closeBracket, startIdx);

                    if (endIdx === -1) {
                        isError = true;
                        errorMessage = `Fehlende schließende Klammer für '${char}'`;
                        break;
                    }

                    const content = paragraph.substring(startIdx, endIdx);
                    const hasSpaces = content.includes(" ");
                    const notes: NoteInfo[] = [];

                    // Parse notes inside brackets
                    for (const c of content) {
                        if (this.isNoteChar(c)) {
                            notes.push(this.charToNoteInfo(c));
                        }
                        // Spaces inside brackets are handled by hasSpaces flag
                    }

                    if (notes.length > 0) {
                        if (hasSpaces) {
                            // [a s d f] = fastest possible sequence
                            events.push({ type: "fastSequence", notes });
                        } else {
                            // [asdf] = simultaneous
                            events.push({ type: "simultaneous", notes });
                        }
                    }

                    lastWasNote = true;
                    i = endIdx + 1;
                    continue;
                }

                // Handle pipe | for pause
                if (char === "|") {
                    // Count consecutive pipes and spaces after pipes
                    let multiplier = 1;
                    let j = i + 1;

                    while (j < paragraph.length) {
                        if (paragraph[j] === "|") {
                            multiplier++;
                            j++;
                        } else if (paragraph[j] === " ") {
                            // Each space after | adds to the pause
                            multiplier++;
                            j++;
                        } else {
                            break;
                        }
                    }

                    events.push({ type: "pause", multiplier });
                    lastWasNote = false;
                    i = j;
                    continue;
                }

                // Handle space (short pause between notes)
                if (char === " " || char === "\t") {
                    // Only add short pause if last was a note and next is a note
                    if (lastWasNote) {
                        // Look ahead to see if there's a note coming
                        let nextNoteIdx = i + 1;
                        while (nextNoteIdx < paragraph.length &&
                               (paragraph[nextNoteIdx] === " " || paragraph[nextNoteIdx] === "\t")) {
                            nextNoteIdx++;
                        }
                        if (nextNoteIdx < paragraph.length &&
                            (this.isNoteChar(paragraph[nextNoteIdx]) ||
                             paragraph[nextNoteIdx] === "[" ||
                             paragraph[nextNoteIdx] === "{")) {
                            events.push({ type: "shortPause" });
                        }
                    }
                    lastWasNote = false;
                    i++;
                    continue;
                }

                // Handle newline (single newline = extended pause)
                if (char === "\n" || char === "\r") {
                    events.push({ type: "extendedPause" });
                    lastWasNote = false;
                    i++;
                    // Skip \r\n combination
                    if (char === "\r" && paragraph[i] === "\n") {
                        i++;
                    }
                    continue;
                }

                // Handle single note
                if (this.isNoteChar(char)) {
                    events.push({ type: "single", note: this.charToNoteInfo(char) });
                    lastWasNote = true;
                    i++;
                    continue;
                }

                // Skip unknown characters
                i++;
            }

            if (isError) break;
        }

        if (isError) {
            this.error = errorMessage;
            return;
        } else {
            this.error = "";
        }

        this.parsedEvents = events;

        // Count actual playable notes
        this.noteCount = events.reduce((count, event) => {
            if (event.type === "single") return count + 1;
            if (event.type === "simultaneous" || event.type === "fastSequence") {
                return count + event.notes.length;
            }
            return count;
        }, 0);

        this.calculateEstimatedDuration();
    }

    private calculateEstimatedDuration() {
        let totalMs = 0;
        // BPM formula: 60000ms / BPM = ms per beat (quarter note)
        const beatMs = 60000 / this.bpm;
        // Base note duration: 1/8 note timing
        const noteMs = beatMs / 2;
        // Short pause (space between notes)
        const shortPauseMs = noteMs * 0.5;
        // Extended pause (newline)
        const extendedPauseMs = beatMs * 0.5;
        const fastSequenceNoteDelay = 5; // Very fast between notes in sequence

        for (const event of this.parsedEvents) {
            switch (event.type) {
                case "single":
                    totalMs += 12 + noteMs; // Note press + 1/8 note timing
                    break;
                case "simultaneous":
                    totalMs += 12 + noteMs; // All pressed at once + 1/8 note timing
                    break;
                case "fastSequence":
                    // Each note in sequence + tiny delay between
                    totalMs += event.notes.length * (12 + fastSequenceNoteDelay) + noteMs;
                    break;
                case "shortPause":
                    totalMs += shortPauseMs; // Small additional pause
                    break;
                case "pause":
                    totalMs += noteMs * event.multiplier; // | = 1/8 note per |
                    break;
                case "extendedPause":
                    totalMs += extendedPauseMs;
                    break;
            }
        }

        // Format as HH:MM:SS
        const totalSeconds = Math.floor(totalMs / 1000);
        const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
        const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
        const seconds = (totalSeconds % 60).toString().padStart(2, "0");
        this.estimatedDuration = `${hours}:${minutes}:${seconds}`;
    }

    public requestSync() {
        this.mainWindow.webContents.send("requestSyncResponse", {
            state: this.state,
            playtime: this.playtime,
            estimatedDuration: this.estimatedDuration,
            noteCount: this.noteCount,
            currentNoteIndex: this.currentNoteIndex,
            notes: this.notes,
            error: this.error,
            isLoop: this.isLoop,
            bpm: this.bpm,
        });
    }

    private timerInterval: NodeJS.Timeout | null = null;
    private startTime: number = 0;
    private pausedTime: number = 0;

    // Send sync data immediately to renderer
    private sendSync() {
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
            this.mainWindow.webContents.send("syncDataResponse", {
                state: this.state,
                playtime: this.playtime,
                estimatedDuration: this.estimatedDuration,
                noteCount: this.noteCount,
                currentNoteIndex: this.currentNoteIndex,
                error: this.error,
                isLoop: this.isLoop,
                bpm: this.bpm,
            });
        }
    }

    private updatePlaytime() {
        if (this.state === "running" && this.startTime > 0) {
            const elapsed = Date.now() - this.startTime - this.pausedTime;
            const date = new Date(elapsed);
            const hours = date.getUTCHours().toString().padStart(2, "0");
            const minutes = date.getUTCMinutes().toString().padStart(2, "0");
            const seconds = date.getUTCSeconds().toString().padStart(2, "0");
            this.playtime = `${hours}:${minutes}:${seconds}`;
        }
    }

    public startTimer() {
        if (this.timerInterval) return;
        this.startTime = Date.now();
        this.pausedTime = 0;
        // Use a faster interval for smoother UI updates
        this.timerInterval = setInterval(() => {
            this.updatePlaytime();
            this.sendSync();
        }, 50);
    }

    public stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        this.startTime = 0;
        this.pausedTime = 0;
    }

    private playbackAborted = false;

    public async startPianoBot() {
        if (this.state === "running") return;

        if (this.state === "paused") {
            this.state = "running";
            this.sendSync();
            setImmediate(() => this.sendSync());
            return;
        }

        this.state = "running";
        this.playtime = "00:00:00";
        this.currentNoteIndex = 0;
        this.playbackAborted = false;
        this.startTimer();
        this.sendSync();
        setImmediate(() => this.sendSync());

        // Run playback
        this.runPlayback();
    }

    private async runPlayback() {
        // BPM formula: 60000ms / BPM = ms per beat (quarter note)
        // But for piano playing, we use subdivisions - 1/8 or 1/16 notes are more common
        const beatMs = 60000 / this.bpm;
        // Base note duration: 1/8 note timing (faster than quarter notes)
        const noteMs = beatMs / 2;
        // Short pause (space between notes) - adds a slight delay
        const shortPauseMs = noteMs * 0.5;
        // Extended pause (newline) - about half a beat
        const extendedPauseMs = beatMs * 0.5;

        let nextBeatTime = Date.now();

        for (let i = 0; i < this.parsedEvents.length; i++) {
            // Check if aborted
            if (this.playbackAborted || this.state === "stopped") {
                await this.cleanup();
                return;
            }

            const event = this.parsedEvents[i];

            // Check pause state
            while (this.state === "paused") {
                if (this.playbackAborted) {
                    await this.cleanup();
                    return;
                }
                await this.sleep(20);
                // Reset timing after pause
                nextBeatTime = Date.now();
            }

            if (this.playbackAborted) {
                await this.cleanup();
                return;
            }

            try {
                switch (event.type) {
                    case "single":
                        this.currentNoteIndex++;
                        await this.playSingleNote(event.note);
                        // Single note uses 1/8 note timing
                        nextBeatTime += noteMs;
                        await this.waitUntil(nextBeatTime);
                        break;

                    case "simultaneous":
                        this.currentNoteIndex += event.notes.length;
                        await this.playSimultaneous(event.notes);
                        // Chord uses 1/8 note timing
                        nextBeatTime += noteMs;
                        await this.waitUntil(nextBeatTime);
                        break;

                    case "fastSequence":
                        for (const note of event.notes) {
                            if (this.playbackAborted) {
                                await this.cleanup();
                                return;
                            }
                            this.currentNoteIndex++;
                            await this.playSingleNote(note);
                            await this.sleep(5);
                        }
                        // After fast sequence, continue with normal timing
                        nextBeatTime += noteMs;
                        await this.waitUntil(nextBeatTime);
                        break;

                    case "shortPause":
                        // Space between notes adds small delay
                        nextBeatTime += shortPauseMs;
                        await this.waitUntil(nextBeatTime);
                        break;

                    case "pause":
                        // | character = pause based on note timing (1/8 note per |)
                        nextBeatTime += noteMs * event.multiplier;
                        await this.waitUntil(nextBeatTime);
                        break;

                    case "extendedPause":
                        nextBeatTime += extendedPauseMs;
                        await this.waitUntil(nextBeatTime);
                        break;
                }
            } catch (error) {
                console.log(error);
            }
        }

        // Finished playing
        await this.cleanup();
        this.state = "stopped";
        this.sendSync();

        if (this.isLoop && !this.playbackAborted) {
            setTimeout(() => this.startPianoBot(), 100);
        }
    }

    // Wait until a specific timestamp, checking for abort
    private async waitUntil(targetTime: number) {
        while (Date.now() < targetTime) {
            if (this.playbackAborted) return;
            const remaining = targetTime - Date.now();
            if (remaining <= 0) break;
            // Sleep in small chunks to allow abort checking
            await this.sleep(Math.min(10, remaining));
        }
    }

    private async playSingleNote(note: NoteInfo) {
        try {
            if (!note.note) return;

            if (note.isHighNote) {
                await keyboard.pressKey(Key.LeftShift);
                await this.sleep(2);
            }

            await keyboard.pressKey(note.note);
            await this.sleep(50);
            await keyboard.releaseKey(note.note);

            if (note.isHighNote) {
                await keyboard.releaseKey(Key.LeftShift);
            }
        } catch (error) {
            try {
                await keyboard.releaseKey(Key.LeftShift);
            } catch {}
            throw error;
        }
    }

    private async playSimultaneous(notes: NoteInfo[]) {
        try {
            const pressedKeys: Key[] = [];

            // Separate high and low notes
            const lowNotes = notes.filter(n => !n.isHighNote && n.note);
            const highNotes = notes.filter(n => n.isHighNote && n.note);

            // Press low notes first (without shift)
            for (const note of lowNotes) {
                if (note.note) {
                    await keyboard.pressKey(note.note);
                    pressedKeys.push(note.note);
                }
            }

            // Press high notes with shift
            if (highNotes.length > 0) {
                await keyboard.pressKey(Key.LeftShift);
                await this.sleep(1);

                for (const note of highNotes) {
                    if (note.note) {
                        await keyboard.pressKey(note.note);
                        pressedKeys.push(note.note);
                    }
                }

                await keyboard.releaseKey(Key.LeftShift);
            }

            // Hold briefly
            await this.sleep(50);

            // Release all notes
            for (const key of pressedKeys) {
                await keyboard.releaseKey(key);
            }
        } catch (error) {
            try {
                await keyboard.releaseKey(Key.LeftShift);
            } catch {}
            throw error;
        }
    }

    private async cleanup() {
        this.stopTimer();
        // Safety: release shift key in case it's stuck
        try {
            await keyboard.releaseKey(Key.LeftShift);
        } catch {}
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    public pausePianoBot() {
        if (this.state !== "running") return;
        this.state = "paused";
        this.sendSync();
        setImmediate(() => this.sendSync());
        setTimeout(() => this.sendSync(), 50);
    }

    public stopPianoBot() {
        if (this.state === "stopped") return;
        this.state = "stopped";
        this.playbackAborted = true;
        this.currentNoteIndex = 0;
        this.sendSync();
        this.stopTimer();
        setImmediate(() => this.sendSync());
        setTimeout(() => this.sendSync(), 50);
    }

    public loadPianoBot() {
        dialog
            .showOpenDialog(this.mainWindow, {
                title: "Noten laden",
                defaultPath: "PianoBot.json",
                filters: [{ name: "JSON", extensions: ["json"] }],
            })
            .then((result) => {
                if (result.canceled) return;
                if (result.filePaths === undefined) return;

                fs.readFile(result.filePaths[0], "utf-8", (err, data) => {
                    if (err) {
                        console.log(err);
                        return;
                    }

                    const pianoBotData = JSON.parse(data);

                    if (pianoBotData.bpm) this.bpm = pianoBotData.bpm;
                    if (pianoBotData.notes) this.notes = pianoBotData.notes;

                    this.parseNotes();
                    this.requestSync();
                });
            });
    }

    public savePianoBot() {
        const data = {
            version: this.version,
            bpm: this.bpm,
            notes: this.notes,
        };

        const dataString = JSON.stringify(data, null, 4);

        dialog
            .showSaveDialog(this.mainWindow, {
                title: "Noten speichern",
                defaultPath: "PianoBot.json",
                filters: [{ name: "JSON", extensions: ["json"] }],
            })
            .then((result) => {
                if (result.canceled) return;
                if (result.filePath === undefined) return;

                fs.writeFileSync(result.filePath, dataString);
            });
    }
}

export default PianoBot.getInstance();
