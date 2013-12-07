/*
VDF (de)serialization
Copyright (c) 2010-2013, Anthony Garcia <anthony@lagg.me>
Distributed under the ISC License (see LICENSE)
 
Ported to node.js by Rob Jackson - rjackson.me.
Minor tweaks for vdfjson by Rob Jackson - rjackson.me.
*/
 
var VDF = {
    STRING: '"',
    NODE_OPEN: '{',
    NODE_CLOSE: '}',
    BR_OPEN: '[',
    BR_CLOSE: ']',
    COMMENT: '/',
    CR: '\r',
    LF: '\n',
    SPACE: ' ',
    TAB: '\t',
    WHITESPACE: [' ', "\t", "\r", "\n"],
 
    _symtostr: function _symtostr(line, i, token) {
        token = token || VDF.STRING;
 
        var opening = i + 1,
            closing = opening;
 
        ci = line.indexOf(token, opening);
        while (ci !== -1) {
            if (line.substring(ci - 1, ci) !== "\\") {
                closing = ci;
                break;
            }
            ci = line.indexOf(token, ci + 1);
        }
 
        finalstr = line.substring(opening, closing);
        return [finalstr, i + finalstr.length + 1];
    },
 
    _unquotedtostr: function _unquotedtostr(line, i) {
        var ci = i;
        while (ci < line.length) {
            if (VDF.WHITESPACE.indexOf(line.substring(ci, ci + 1)) > -1) {
                break;
            }
            ci += 1;
        }
        return [line.substring(i, ci), ci];
    },
 
    _parse: function _parse(stream, ptr) {
        ptr = ptr || 0;
 
        var laststr,
            lasttok,
            lastbrk,
            i = ptr,
            next_is_value = false,
            deserialized = {};
 
        while (i < stream.length) {
            var c = stream.substring(i, i + 1);
 
            if (c === VDF.NODE_OPEN) {
                next_is_value = false;  // Make sure the next string is interpreted as a key.
 
                var parsed = VDF._parse(stream, i + 1);
                deserialized[laststr] = parsed[0];
                i = parsed[1];
            }
            else if (c === VDF.NODE_CLOSE) {
                return [deserialized, i];
            }
            else if (c === VDF.BR_OPEN) {
                var _string = VDF._symtostr(stream, i, VDF.BR_CLOSE);
                lastbrk = _string[0];
                i = _string[1];
            }
            else if (c === VDF.COMMENT) {
                if ((i + 1) < stream.length && stream.substring(i + 1, i + 2) === "/") {
                    i = stream.indexOf("\n", i);
                }
            }
            else if (c === VDF.CR || c === VDF.LF) {
                var ni = i + 1;
                if (ni < stream.length && stream.substring(ni, ni + 1) === VDF.LF) {
                    i = ni;
                }
                if (lasttok != VDF.LF) {
                    c = VDF.LF;
                }
            }
            else if (c !== VDF.SPACE && c !== VDF.TAB) {
                var _string = (c === VDF.STRING ? VDF._symtostr : VDF._unquotedtostr)(stream, i);
                string = _string[0];
                i = _string[1];
 
                if (lasttok === VDF.STRING && next_is_value) {
                    if (deserialized[laststr] && lastbrk !== undefined) {
                        lastbrk = undefined;  // Ignore this sentry if it's the second bracketed expression
                    }
                    else {
                        deserialized[laststr] = string;
                    }
                }
                c = VDF.STRING;  // Force c == string so lasttok will be set properly.
                laststr = string;
                next_is_value = !next_is_value;
            }
            else {
                c = lasttok;
            }
 
            lasttok = c;
            i += 1;
        }
 
        return [deserialized, i];
    },
 
    _dump: function _dump(obj, indent, mult) {
        indent = indent || 0,
        mult = mult || 2;
 
        function _i() {
            return Array(indent * mult + 1).join(" ");
        }
 
        var nodefmt = '\n' + _i() + '"%s"\n' + _i() + '{\n%s' + _i() + '}\n\n',
            podfmt = _i() + '"%s" "%s"\n',
            lstfmt = _i() + (Array(mult + 1).join(" ")) + '"%s" "1"';
 
        indent += 1;
 
        var nodes = [];
 
        for (var k in obj) {
            var v = obj[k];
            if (typeof v === 'object' && !(v instanceof Array)) {
                nodes.push('\n' + _i() + '"' + k + '"\n' + _i() + '{\n' + VDF._dump(v, indent, mult) + _i() + '}\n\n');
            }
            else if (v instanceof Array) {
                lst = v.map(function(more_v){ return (Array(mult + 1).join(" ")) + '"' + more_v + '" "1"'; });
                nodes.push('\n' + _i() + '"' + k + '"\n' + _i() + '{\n' + lst.join("\n") + '\n' + _i() + '}\n\n');
            }
            else {
                nodes.push('"' + k + '" "' + v + '"\n');
            }
        }
 
        indent -= 1;
        return nodes.join("");
    },
 
    parse: function parse(string) {
        var _parsed = VDF._parse(string);
        res = _parsed[0];
        ptr = _parsed[1];
        return res;
    },
 
    dump: function dump(obj) {
        return VDF._dump(obj);
    }
};
