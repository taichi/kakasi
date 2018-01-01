@{%
var appendItemChar = function(d) { return d[0].join(""); };
var unquote = function (d) { return d[1]; };
%}

value               -> string
                     | value ws string                   {% function (d) { return d[0].concat([d[2]]); } %}

string              -> unquoted_value                    {% id %}
                     | "\"" double_quoted "\""           {% unquote %}
                     | "'" single_quoted "'"             {% unquote %}

double_quoted       -> double_quoted_value:+             {% appendItemChar %}
double_quoted_value -> [^"]                              {% id %}
                     | "\"\""                            {% function (d) { return "\""; } %}

single_quoted       -> single_quoted_value:+             {% appendItemChar %}
single_quoted_value -> [^']                              {% id %}
                     | "''"                              {% function (d) { return "'"; } %}

unquoted_value      -> char:+                            {% appendItemChar %}

char                -> [^\s"']
ws                  -> [\s]:+
