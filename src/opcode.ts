/* eslint-disable prettier/prettier */

// https://github.com/python/cpython/blob/f329a8bc1e57e454852f8887df6267b42047cd1b/Lib/pickle.py#L105
export const MARK                  = 40;    // '(' # push special markobject on stack
export const STOP                  = 46;    // '.' # every pickle ends with STOP
export const POP                   = 48;    // '0' # discard topmost stack item
export const POP_MARK              = 49;    // '1' # discard stack top through topmost markobject
export const DUP                   = 50;    // '2' # duplicate top stack item
export const FLOAT                 = 70;    // 'F' # push float object; decimal string argument
export const INT                   = 73;    // 'I' # push integer or bool; decimal string argument
export const BININT                = 74;    // 'J' # push four-byte signed int
export const BININT1               = 75;    // 'K' # push 1-byte unsigned int
export const LONG                  = 76;    // 'L' # push long; decimal string argument
export const BININT2               = 77;    // 'M' # push 2-byte unsigned int
export const NONE                  = 78;    // 'N' # push None
export const PERSID                = 80;    // 'P' # push persistent object; id is taken from string arg
export const BINPERSID             = 81;    // 'Q' #  "       "         "  ;  "  "   "     "  stack
export const REDUCE                = 82;    // 'R' # apply callable to argtuple, both on stack
export const STRING                = 83;    // 'S' # push string; NL-terminated string argument
export const BINSTRING             = 84;    // 'T' # push string; counted binary string argument
export const SHORT_BINSTRING       = 85;    // 'U' #  "     "   ;    "      "       "      " < 256 bytes
export const UNICODE               = 86;    // 'V' # push Unicode string; raw-unicode-escaped'd argument
export const BINUNICODE            = 88;    // 'X' #   "     "       "  ; counted UTF-8 string argument
export const APPEND                = 97;    // 'a' # append stack top to list below it
export const BUILD                 = 98;    // 'b' # call __setstate__ or __dict__.update()
export const GLOBAL                = 99;    // 'c' # push self.find_class(modname, name); 2 string args
export const DICT                  = 100;   // 'd' # build a dict from stack items
export const EMPTY_DICT            = 125;   // '}' # push empty dict
export const APPENDS               = 101;   // 'e' # extend list on stack by topmost stack slice
export const GET                   = 103;   // 'g' # push item from memo on stack; index is string arg
export const BINGET                = 104;   // 'h' #   "    "    "    "   "   "  ;   "    " 1-byte arg
export const INST                  = 105;   // 'i' # build & push class instance
export const LONG_BINGET           = 106;   // 'j' # push item from memo on stack; index is 4-byte arg
export const LIST                  = 108;   // 'l' # build list from topmost stack items
export const EMPTY_LIST            = 93;    // ']' # push empty list
export const OBJ                   = 111;   // 'o' # build & push class instance
export const PUT                   = 112;   // 'p' # store stack top in memo; index is string arg
export const BINPUT                = 113;   // 'q' #   "     "    "   "   " ;   "    " 1-byte arg
export const LONG_BINPUT           = 114;   // 'r' #   "     "    "   "   " ;   "    " 4-byte arg
export const SETITEM               = 115;   // 's' # add key+value pair to dict
export const TUPLE                 = 116;   // 't' # build tuple from topmost stack items
export const EMPTY_TUPLE           = 41;    // ')' # push empty tuple
export const SETITEMS              = 117;   // 'u' # modify dict by adding topmost key+value pairs
export const BINFLOAT              = 71;    // 'G' # push float; arg is 8-byte float encoding

// Protocol 2 
export const PROTO                 = 128;   // '\x80' # identify pickle protocol
export const NEWOBJ                = 129;   // '\x81' # build object by applying cls.__new__ to argtuple
export const EXT1                  = 130;   // '\x82' # push object from extension registry; 1-byte index
export const EXT2                  = 131;   // '\x83' # ditto, but 2-byte index
export const EXT4                  = 132;   // '\x84' # ditto, but 4-byte index
export const TUPLE1                = 133;   // '\x85' # build 1-tuple from stack top
export const TUPLE2                = 134;   // '\x86' # build 2-tuple from two topmost stack items
export const TUPLE3                = 135;   // '\x87' # build 3-tuple from three topmost stack items
export const NEWTRUE               = 136;   // '\x88' # push True
export const NEWFALSE              = 137;   // '\x89' # push False
export const LONG1                 = 138;   // '\x8a' # push long from < 256 bytes
export const LONG4                 = 139;   // '\x8b' # push really big long

// Protocol 3 (Python 3.x)
export const BINBYTES              = 66;    // 'B' # push bytes; counted binary string argument
export const SHORT_BINBYTES        = 67;    // 'C' #  "     "   ;    "      "       "      " < 256 bytes

// Protocol 4
export const SHORT_BINUNICODE      = 140;   // '\x8c' # push short string; UTF-8 length < 256 bytes
export const BINUNICODE8           = 141;   // '\x8d' # push very long string
export const BINBYTES8             = 142;   // '\x8e' # push very long bytes string
export const EMPTY_SET             = 143;   // '\x8f' # push empty set on the stack
export const ADDITEMS              = 144;   // '\x90' # modify set by adding topmost stack items
export const FROZENSET             = 145;   // '\x91' # build frozenset from topmost stack items
export const NEWOBJ_EX             = 146;   // '\x92' # like NEWOBJ but work with keyword only arguments
export const STACK_GLOBAL          = 147;   // '\x93' # same as GLOBAL but using names on the stacks
export const MEMOIZE               = 148;   // '\x94' # store top of the stack in memo
export const FRAME                 = 149;   // '\x95' # indicate the beginning of a new frame

// Protocol 5
export const BYTEARRAY8            = 150;   // '\x96' # push bytearray
export const NEXT_BUFFER           = 151;   // '\x97' # push next out-of-band buffer
export const READONLY_BUFFER       = 152;   // '\x98' # make top of stack readonly

export const _tuplesize2code       = [EMPTY_TUPLE, TUPLE1, TUPLE2, TUPLE3]