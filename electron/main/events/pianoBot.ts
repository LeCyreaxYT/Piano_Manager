import { BrowserWindow, contextBridge, globalShortcut, ipcMain } from "electron";
import { Hardware, KeyboardButton } from "keysender";
import { CharToKeyCode, isCharAlwaysHigh } from "../virtualdictionary";
const keysender = new Hardware();

interface MultiNote {
    isHighNote: boolean;
    note: KeyboardButton | null;
    delay: number;
}

interface SingleNote {
    isHighNote: boolean;
    note: KeyboardButton | null;
    delay: number;
}

interface PianoNotes {
    isMultiNote?: boolean;
    mulitNote?: MultiNote[];
    singleNote?: SingleNote;

    pause?: boolean;
}

class PianoBot {
    private static instance: PianoBot;
    private constructor() {}

    private mainWindow: BrowserWindow;

    // Main Data
    private version: string = "0.0.1";
    private state = "stopped";
    private playtime: string = "00:00:00";
    private notesCount: number = 0;
    private notesRaw: ""
    private notes: PianoNotes[] = [];

    private errorMessages: string = "";


    // Settings Data
    private startHotkey: string = "F2";
    private stopHotkey: string = "F4";
    private pauseHotkey: string = "F3";
    private bpm: number = 100;

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

        // Sync Data
        ipcMain.on("syncData", (event, data) => {
            if (data.version) this.version = data.version;
            if (data.state) this.state = data.state;
            if (data.playtime) this.playtime = data.playtime;
            if (data.notesCount) this.notesCount = data.notesCount;
            if (data.notesRaw) { this.notesRaw = data.notesRaw; this.formatNotes(); }
            if (data.notes) this.notes = data.notes;

            if (data.errorMessages) this.errorMessages = data.errorMessages;

            if (data.startHotkey) this.startHotkey = data.startHotkey;
            if (data.stopHotkey) this.stopHotkey = data.stopHotkey;
            if (data.pauseHotkey) this.pauseHotkey = data.pauseHotkey;
            if (data.bpm) this.bpm = data.bpm;
        });

        setInterval(() => {
            mainWindow.webContents.send("syncDataResponse", {
                version: this.version,
                state: this.state,
                playtime: this.playtime,
                notesCount: this.notesCount,
                notes: this.notes,
                errorMessages: this.errorMessages,
            });
        }, 200);

        this.mainWindow = mainWindow;
    }

    public formatNotes() {
        let nodes = this.notesRaw.replace(/ /g, "");
        let notesArray = nodes.split("");
        this.notesCount = notesArray.length;
        this.registerNotes(notesArray)
    }

    public registerNotes(notesArray: string[]) {
        let notes: PianoNotes[] = [];
        let isMultiNote = false;

        let isError = false;
        let errorMessage = "";

        let bufferNormalNote: PianoNotes = { 
            isMultiNote: false,
            singleNote: {
                isHighNote: false,
                note: null,
                delay: 0,
            },
        };

        let bufferMultiNote: PianoNotes = {
            isMultiNote: true,
            mulitNote: [],
        };

        for (const note of notesArray) {
            switch (note) {
                case "[":
                    if (isMultiNote) {
                        isError = true;
                        errorMessage = "Die Multi Note wurde bereits gestartet";
                        continue;
                    }

                    isMultiNote = true;
                    continue;
                case "]":
                    if (!isMultiNote) {
                        isError = true;
                        errorMessage = "Die Multi Note wurde nicht gestartet";
                        return;
                    }

                    isMultiNote = false;
                    notes.push(bufferMultiNote);

                    bufferMultiNote = {
                        isMultiNote: true,
                        mulitNote: [],
                    };
                    continue;
                case "{":
                    if (isMultiNote) {
                        isError = true;
                        errorMessage = "Die Multi Note wurde bereits gestartet";
                        continue;
                    }

                    isMultiNote = true;
                    continue;
                case "}":
                    if (!isMultiNote) {
                        isError = true;
                        errorMessage = "Die Multi Note wurde nicht gestartet";
                        return;
                    }

                    isMultiNote = false;
                    notes.push(bufferMultiNote);
                    bufferMultiNote = {
                        isMultiNote: true,
                        mulitNote: [],
                    };
                    continue;
                case "|" || "\n" || "\r":
                    notes.push({
                        isMultiNote: false,
                        singleNote: {
                            isHighNote: false,
                            note: ";",
                            delay: 0,
                        },
                    })
                    continue;

                case " ":
                    continue;
                default:
                    if (isMultiNote) {    
                        let isHighNote = note === note.toUpperCase();
                        let note2 = note;

                        const isAlwaysHigh = isCharAlwaysHigh(note);
                        if (isAlwaysHigh) {
                            isHighNote = true;   
                        }

                        if (isHighNote) {
                            note2 = note.toLowerCase();
                        }

                        const multiNote: MultiNote = {
                            note: CharToKeyCode(note2),
                            delay: 0,
                            isHighNote: isHighNote
                        };
                        bufferMultiNote.mulitNote.push(multiNote);
                    } else {
                        let isHighNote = note === note.toUpperCase();
                        let note2 = note;

                        const isAlwaysHigh = isCharAlwaysHigh(note);
                        if (isAlwaysHigh) {
                            isHighNote = true;
                        }

                        if (isHighNote) {
                            note2 = note.toLowerCase();
                        }

                        const singleNote: SingleNote = {
                            note: CharToKeyCode(note2),
                            delay: 0,
                            isHighNote: isHighNote
                        };

                        bufferNormalNote.singleNote = singleNote;
                        notes.push(bufferNormalNote);
                        bufferNormalNote = {
                            isMultiNote: false,
                            singleNote: {
                                isHighNote: false,
                                note: null,
                                delay: 0,
                            },
                        };
                    }
            }
        }    

        if (isMultiNote) {
            isError = true;
            errorMessage = "Die Multi Note wurde nicht beendet";
        }

        if (isError) {
            this.errorMessages = errorMessage;
            return;
        } else {
            this.errorMessages = "";
        }

        this.notes = notes;
    }

    public requestSync() {
        this.mainWindow.webContents.send("requestSyncResponse", {
            version: this.version,
            state: this.state,
            playtime: this.playtime,
            notesCount: this.notesCount,
            notes: this.notes,
            notesRaw: this.notesRaw,
            errorMessages: this.errorMessages,

            startHotkey: this.startHotkey,
            stopHotkey: this.stopHotkey,
            pauseHotkey: this.pauseHotkey,
            bpm: this.bpm,
        });
    }

    public async startPianoBot() {
        if (this.state === "running") return;
        this.state = "running";
        this.playtime = "00:00:00";

        const startTime = Date.now();
        const interval = setInterval(() => {
            const time = Date.now() - startTime;
            const seconds = Math.floor(time / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);

            this.playtime = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
        }, 1000);
        

        for (const note of this.notes) {
            while (this.state === "paused") {
                await new Promise((resolve) => setTimeout(resolve, 100));
            }

            if (this.state === "stopped") {
                clearInterval(interval);
                return;
            };

            try {
                if (note.pause) {
                    await new Promise((resolve) => setTimeout(resolve, 60000 / (this.bpm * 2)));
                    continue;
                }
                
                if (note.isMultiNote) {
                    for (const multiNote of note.mulitNote) {
                        if (multiNote.isHighNote) {
                            keysender.keyboard.toggleKey("shift", true);
                            await new Promise((resolve) => setTimeout(resolve, 1));
                        }

                        keysender.keyboard.toggleKey(multiNote.note, true);
                        await new Promise((resolve) => setTimeout(resolve, 10));
                        keysender.keyboard.toggleKey(multiNote.note, false);
                        keysender.keyboard.toggleKey("shift", false);
                    }
                } else {
                    if (note.singleNote.isHighNote) {
                        keysender.keyboard.toggleKey("shift", true);
                        await new Promise((resolve) => setTimeout(resolve, 1));
                    }

                    keysender.keyboard.toggleKey(note.singleNote.note, true);
                    await new Promise((resolve) => setTimeout(resolve, 10));
                    keysender.keyboard.toggleKey(note.singleNote.note, false);
                    keysender.keyboard.toggleKey("shift", false);
                }

                // Delay BPM
                await new Promise((resolve) => setTimeout(resolve, 60000 / (this.bpm * 2)));
            } catch (error) {
                console.log(error);
            }
        }
    }

    public pausePianoBot() {
        this.state = "paused";
    }

    public stopPianoBot() {
        this.state = "stopped";
    }

    public loadPianoBot() {

    }

    public savePianoBot() {

    }

    // public testStart() {
    //     const sequence: PianoKeys[] = [
    //         { key: "a", delay: 100 },
    //         { key: "s", delay: 100 },
    //         { key: "d", delay: 100 },
    //         { key: "f", delay: 100 },
    //         { key: "g", delay: 100 },
    //         { key: "h", delay: 100 },
    //         { key: "j", delay: 100 },
    //         { key: "k", delay: 100 },
    //     ];

    //     this.sendSequence(sequence, 1000);
    // }

    // public async sendKey(entry: PianoKeys) {
    //     robot.keyTap(entry.key);

    //     // Delay
    //     await new Promise(resolve => setTimeout(resolve, entry.delay));
    // }

    // public async sendSequence(sequence: PianoKeys[], delay: number) {
    //     for (const entry of sequence)
    //     {
    //         await this.sendKey(entry);
    //         await new Promise(resolve => setTimeout(resolve, delay));
    //     }
    // }
}

export default PianoBot.getInstance();