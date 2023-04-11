/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */

// https://github.com/python/cpython/blob/f329a8bc1e57e454852f8887df6267b42047cd1b/Lib/pickle.py#L105
// Const enum will be inlined at compile time, see: https://www.typescriptlang.org/docs/handbook/enums.html#const-enums
export const enum OP {
    MARK                  = 40,    // '(' # push special markobject on stack
    STOP                  = 46,    // '.' # every pickle ends with STOP
    POP                   = 48,    // '0' # discard topmost stack item
    POP_MARK              = 49,    // '1' # discard stack top through topmost markobject
    DUP                   = 50,    // '2' # duplicate top stack item
    FLOAT                 = 70,    // 'F' # push float object; decimal string argument
    INT                   = 73,    // 'I' # push integer or bool; decimal string argument
    BININT                = 74,    // 'J' # push four-byte signed int
    BININT1               = 75,    // 'K' # push 1-byte unsigned int
    LONG                  = 76,    // 'L' # push long; decimal string argument
    BININT2               = 77,    // 'M' # push 2-byte unsigned int
    NONE                  = 78,    // 'N' # push None
    PERSID                = 80,    // 'P' # push persistent object; id is taken from string arg
    BINPERSID             = 81,    // 'Q' #  "       "         "  ;  "  "   "     "  stack
    REDUCE                = 82,    // 'R' # apply callable to argtuple, both on stack
    STRING                = 83,    // 'S' # push string; NL-terminated string argument
    BINSTRING             = 84,    // 'T' # push string; counted binary string argument
    SHORT_BINSTRING       = 85,    // 'U' #  "     "   ;    "      "       "      " < 256 bytes
    UNICODE               = 86,    // 'V' # push Unicode string; raw-unicode-escaped'd argument
    BINUNICODE            = 88,    // 'X' #   "     "       "  ; counted UTF-8 string argument
    APPEND                = 97,    // 'a' # append stack top to list below it
    BUILD                 = 98,    // 'b' # call __setstate__ or __dict__.update()
    GLOBAL                = 99,    // 'c' # push self.find_class(modname, name); 2 string args
    DICT                  = 100,   // 'd' # build a dict from stack items
    EMPTY_DICT            = 125,   // '}' # push empty dict
    APPENDS               = 101,   // 'e' # extend list on stack by topmost stack slice
    GET                   = 103,   // 'g' # push item from memo on stack; index is string arg
    BINGET                = 104,   // 'h' #   "    "    "    "   "   "  ;   "    " 1-byte arg
    INST                  = 105,   // 'i' # build & push class instance
    LONG_BINGET           = 106,   // 'j' # push item from memo on stack; index is 4-byte arg
    LIST                  = 108,   // 'l' # build list from topmost stack items
    EMPTY_LIST            = 93,    // ']' # push empty list
    OBJ                   = 111,   // 'o' # build & push class instance
    PUT                   = 112,   // 'p' # store stack top in memo; index is string arg
    BINPUT                = 113,   // 'q' #   "     "    "   "   " ;   "    " 1-byte arg
    LONG_BINPUT           = 114,   // 'r' #   "     "    "   "   " ;   "    " 4-byte arg
    SETITEM               = 115,   // 's' # add key+value pair to dict
    TUPLE                 = 116,   // 't' # build tuple from topmost stack items
    EMPTY_TUPLE           = 41,    // ')' # push empty tuple
    SETITEMS              = 117,   // 'u' # modify dict by adding topmost key+value pairs
    BINFLOAT              = 71,    // 'G' # push float; arg is 8-byte float encoding

    // Protocol 2
    PROTO                 = 128,   // '\x80' # identify pickle protocol
    NEWOBJ                = 129,   // '\x81' # build object by applying cls.__new__ to argtuple
    EXT1                  = 130,   // '\x82' # push object from extension registry; 1-byte index
    EXT2                  = 131,   // '\x83' # ditto, but 2-byte index
    EXT4                  = 132,   // '\x84' # ditto, but 4-byte index
    TUPLE1                = 133,   // '\x85' # build 1-tuple from stack top
    TUPLE2                = 134,   // '\x86' # build 2-tuple from two topmost stack items
    TUPLE3                = 135,   // '\x87' # build 3-tuple from three topmost stack items
    NEWTRUE               = 136,   // '\x88' # push True
    NEWFALSE              = 137,   // '\x89' # push False
    LONG1                 = 138,   // '\x8a' # push long from < 256 bytes
    LONG4                 = 139,   // '\x8b' # push really big long

    // Protocol 3 (Python 3.x)
    BINBYTES              = 66,    // 'B' # push bytes; counted binary string argument
    SHORT_BINBYTES        = 67,    // 'C' #  "     "   ;    "      "       "      " < 256 bytes

    // Protocol 4
    SHORT_BINUNICODE      = 140,   // '\x8c' # push short string; UTF-8 length < 256 bytes
    BINUNICODE8           = 141,   // '\x8d' # push very long string
    BINBYTES8             = 142,   // '\x8e' # push very long bytes string
    EMPTY_SET             = 143,   // '\x8f' # push empty set on the stack
    ADDITEMS              = 144,   // '\x90' # modify set by adding topmost stack items
    FROZENSET             = 145,   // '\x91' # build frozenset from topmost stack items
    NEWOBJ_EX             = 146,   // '\x92' # like NEWOBJ but work with keyword only arguments
    STACK_GLOBAL          = 147,   // '\x93' # same as GLOBAL but using names on the stacks
    MEMOIZE               = 148,   // '\x94' # store top of the stack in memo
    FRAME                 = 149,   // '\x95' # indicate the beginning of a new frame

    // Protocol 5
    BYTEARRAY8            = 150,   // '\x96' # push bytearray
    NEXT_BUFFER           = 151,   // '\x97' # push next out-of-band buffer
    READONLY_BUFFER       = 152,   // '\x98' # make top of stack readonly
}
