@preprocessor typescript

@{%
import { NODE_TYPE, node } from "./node";

const concatChar = d => { return d[0].join(""); };
%}

command             -> (string | expression) (ws (string | expression)):* {% 
  d => d[1].reduce((a, c) => a.concat(c[1]), d[0])
%}

expression          -> "$(" expression_string ")"        {% node(NODE_TYPE.EXPRESSION, 1) %}
expression_string   -> string (ws string):*              {%
  d => d[1].reduce((a, c) => a.concat(c[1]), [d[0]])
%}

string              -> unquoted_value                    {% node(NODE_TYPE.TEXT, 0) %}
                     | "\"" double_quoted "\""           {% node(NODE_TYPE.TEXT, 1) %}
                     | "'" single_quoted "'"             {% node(NODE_TYPE.TEXT, 1) %}

double_quoted       -> double_quoted_value:+             {% concatChar %}
double_quoted_value -> [^"]                              
                     | "\"\""                            {% d => { return "\""; } %}

single_quoted       -> single_quoted_value:+             {% concatChar %}
single_quoted_value -> [^']                              
                     | "''"                              {% d => { return "'"; } %}

unquoted_value      -> char:+                            {% concatChar %}

char                -> [^\s"'()]
ws                  -> [\s]:+                            {% concatChar %}
