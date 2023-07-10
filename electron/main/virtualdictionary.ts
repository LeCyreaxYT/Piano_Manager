import { Hardware, KeyboardButton } from "keysender";

export function CharToKeyCode(char: string): KeyboardButton {
    switch (char) {
        case 'a' || 'A':
            return "a"
        case 'b' || 'B':
            return "b"
        case 'c' || 'C':
            return "c"
        case 'd' || 'D':
            return "d"
        case 'e' || 'E':
            return "e"
        case 'f' || 'F':
            return "f"
        case 'g' || 'G':
            return "g"
        case 'h' || 'H':
            return "h"
        case 'i' || 'I':
            return "i"
        case 'j' || 'J':
            return "j"
        case 'k' || 'K':
            return "k"
        case 'l' || 'L':
            return "l"
        case 'm' || 'M':
            return "m"
        case 'n' || 'N':
            return "n"
        case 'o' || 'O':
            return "o"
        case 'p' || 'P':
            return "p"
        case 'q' || 'Q':
            return "q"
        case 'r' || 'R':
            return "r"
        case 's' || 'S':
            return "s"
        case 't' || 'T':
            return "t"
        case 'u' || 'U':
            return "u"
        case 'v' || 'V':
            return "v"
        case 'w' || 'W':
            return "w"
        case 'x' || 'X':
            return "x"
        case 'y' || 'Y':
            return "y"
        case 'z' || 'Z':
            return "z"
        case '0':
            return "0"
        case '1':
            return "1"
        case '2':
            return "2"
        case '3':
            return "3"
        case '4':
            return "4"
        case '5':
            return "5"
        case '6':
            return "6"
        case '7':
            return "7"
        case '8':
            return "8"
        case '9':
            return "9"
        case ' ':
            return "-"
        case '!':
            return "1"
        case '@':
            return "2"
        case '#':
            return "3"
        case '$':
            return "4"
        case '%':
            return "5"
        case '^':
            return "6"
        case '&':
            return "7"
        case '*':
            return "8"
        case '(':
            return "9"
    }
}

export function isCharAlwaysHigh(char: string): boolean {
    switch (char) {
        case "!":
            return true
        case "@":
            return true
        case "$":
            return true
        case "%":
            return true
        case "^":
            return true
        case "&":
            return true
        case "*":
            return true
        case "(":
            return true
        default:
            return false
    }
}