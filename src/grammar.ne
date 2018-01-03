@preprocessor typescript

@{%
import { ComboNode, ExpressionNode, TextNode } from "./node";

// @ts-ignore
const concatChar = d => { return d[0].join(""); };
%}

command             -> (string | expression | combo) (ws (string | expression | combo)):* {%
  // @ts-ignore
  d => d[1].reduce((a, c) => a.concat(c[1]), d[0])
%}

combo               -> string expression                 {% ComboNode.of(2) %}
                     | expression string                 {% ComboNode.of(2) %}
                     | string expression string          {% ComboNode.of(3) %}

expression          -> "$(" expression_string ")"        {% ExpressionNode.of(1) %}
expression_string   -> string (ws string):*              {%
  // @ts-ignore
  d => d[1].reduce((a, c) => a.concat(c[1]), [d[0]])
%}

string              -> unquoted_value                    {% TextNode.of(0) %}
                     | "\"" double_quoted "\""           {% TextNode.of(1) %}
                     | "'" single_quoted "'"             {% TextNode.of(1) %}

double_quoted       -> double_quoted_value:+             {% concatChar %}
double_quoted_value -> [^"]                              
                     | "\"\""                            {% d => { return "\""; } %}

single_quoted       -> single_quoted_value:+             {% concatChar %}
single_quoted_value -> [^']                              
                     | "''"                              {% d => { return "'"; } %}

unquoted_value      -> [^\s"'()]:+                       {% concatChar %}
ws                  -> [\s]:+                            {% concatChar %}
