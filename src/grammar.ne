@{%
var appendItem = function (a, b) { return function (d) { return d[a].concat([d[b]]); } };
var appendItemChar = function (a, b) { return function (d) { return d[a].concat(d[b]); } };
var unquote = function (d) { return d[1]; };
var emptyStr = function (d) { return ""; };
%}

value               -> string
                     | value ws string                   {% appendItem(0,2) %}
string              -> unquoted_value                    {% id %}
                     | "\"" double_quoted "\""           {% unquote %}
                     | "'" single_quoted "'"             {% unquote %}

double_quoted       -> null                              {% emptyStr %}
                     | double_quoted double_quoted_value {% appendItemChar(0,1) %}
double_quoted_value -> [^"]                              {% id %}
                     | "\"" "\""                         {% function (d) { return "\""; } %}

single_quoted       -> null                              {% emptyStr %}
                     | single_quoted single_quoted_value {% appendItemChar(0,1) %}
single_quoted_value -> [^']                              {% id %}
                     | "'" "'"                           {% function (d) { return "'"; } %}

unquoted_value      -> null                              {% emptyStr %}
                     | unquoted_value char               {% appendItemChar(0,1) %}

char                -> [^\s"']
ws                  -> [\s]
