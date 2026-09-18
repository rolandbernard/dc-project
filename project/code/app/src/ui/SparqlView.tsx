import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
    coldarkCold as light,
    coldarkDark as dark,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { useColorTheme } from "../hooks";

interface Props {
    source: string;
}

export default function SparqlView(props: Props) {
    const theme = useColorTheme();
    return (
        <div className="flex-1 min-h-0 flex flex-col px-4 rounded overflow-hidden">
            <SyntaxHighlighter
                language="sparql"
                style={theme == "dark" ? dark : light}
                customStyle={{
                    borderRadius: "8px",
                    padding: "1rem",
                    fontSize: "0.9rem",
                }}
                showLineNumbers
            >
                {props.source}
            </SyntaxHighlighter>
        </div>
    );
}
