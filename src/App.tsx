import { APITester } from "./APITester";
import "./index.css";

import logo from "./logo.svg";
import { MarkdownLatexPreviewer } from "./MarkdownWithLatex";
import reactLogo from "./react.svg";
import "katex/dist/katex.min.css";

export function App() {
  return (
    <div className="">
      <MarkdownLatexPreviewer />
    </div>
  );
}

export default App;
