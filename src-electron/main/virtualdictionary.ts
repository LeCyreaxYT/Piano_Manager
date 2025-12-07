import { Key } from "@nut-tree-fork/nut-js";

export function CharToKeyCode(char: string): Key | null {
    switch (char.toLowerCase()) {
        case 'a':
            return Key.A;
        case 'b':
            return Key.B;
        case 'c':
            return Key.C;
        case 'd':
            return Key.D;
        case 'e':
            return Key.E;
        case 'f':
            return Key.F;
        case 'g':
            return Key.G;
        case 'h':
            return Key.H;
        case 'i':
            return Key.I;
        case 'j':
            return Key.J;
        case 'k':
            return Key.K;
        case 'l':
            return Key.L;
        case 'm':
            return Key.M;
        case 'n':
            return Key.N;
        case 'o':
            return Key.O;
        case 'p':
            return Key.P;
        case 'q':
            return Key.Q;
        case 'r':
            return Key.R;
        case 's':
            return Key.S;
        case 't':
            return Key.T;
        case 'u':
            return Key.U;
        case 'v':
            return Key.V;
        case 'w':
            return Key.W;
        case 'x':
            return Key.X;
        case 'y':
            return Key.Y;
        case 'z':
            return Key.Z;
        case '0':
            return Key.Num0;
        case '1':
            return Key.Num1;
        case '2':
            return Key.Num2;
        case '3':
            return Key.Num3;
        case '4':
            return Key.Num4;
        case '5':
            return Key.Num5;
        case '6':
            return Key.Num6;
        case '7':
            return Key.Num7;
        case '8':
            return Key.Num8;
        case '9':
            return Key.Num9;
        case ' ':
            return Key.Minus;
        case '!':
            return Key.Num1;
        case '@':
            return Key.Num2;
        case '#':
            return Key.Num3;
        case '$':
            return Key.Num4;
        case '%':
            return Key.Num5;
        case '^':
            return Key.Num6;
        case '&':
            return Key.Num7;
        case '*':
            return Key.Num8;
        case '(':
            return Key.Num9;
        default:
            return null;
    }
}

export function isNumberChar(char: string): boolean {
    switch (char) {
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
            return true;
        default:
            return false;
    }
}

export function isCharAlwaysHigh(char: string): boolean {
    switch (char) {
        case "!":
        case "@":
        case "$":
        case "%":
        case "^":
        case "&":
        case "*":
        case "(":
            return true;
        default:
            return false;
    }
}
