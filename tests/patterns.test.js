import { describe, it, expect } from "vitest";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { resolve, join } from "node:path";

const root = resolve(__dirname, "..");

function walk(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

const srcFiles = walk(join(root, "src"));

const tsText = srcFiles
  .filter((f) => f.endsWith(".ts"))
  .map((f) => readFileSync(f, "utf8"))
  .join("\n");

function justificationFor(patternName) {
  // Match a JSDoc-ish block that contains the three required labels in order
  // for the given pattern name.
  const re = new RegExp(
    `Patr[oó]n\\s*:\\s*${patternName}[\\s\\S]{0,400}?Problema\\s+que\\s+resuelve\\s*:[\\s\\S]{0,400}?Implementaci[oó]n\\s*:`,
    "i",
  );
  return re.test(tsText);
}

describe("Reactive APIs", () => {
  it("uses the Proxy API somewhere in the source", () => {
    expect(/\bnew\s+Proxy\s*\(/.test(tsText), "se requiere usar 'new Proxy(...)' al menos una vez").toBe(true);
  });

  it("implements an Observer pattern (subscribe / notify / emit)", () => {
    const hasObserver =
      /\b(subscribe|addObserver|on)\s*\(/.test(tsText) &&
      /\b(notify|emit)\s*\(/.test(tsText);
    expect(hasObserver, "se requiere un Observer con métodos subscribe/notify (o on/emit)").toBe(true);
  });

  it("uses MutationObserver to detect message edits", () => {
    expect(
      /\bnew\s+MutationObserver\s*\(/.test(tsText),
      "se requiere instanciar 'new MutationObserver(...)' para detectar la edición de mensajes",
    ).toBe(true);
  });

  it("supports editing messages (contenteditable + an EditMessageCommand)", () => {
    const hasContentEditable = /contenteditable/i.test(tsText) || /contentEditable/.test(tsText);
    const hasEditCommand = /class\s+\w*Edit\w*Command\b/.test(tsText) || /Commands?\s*\.\s*EDIT/.test(tsText);
    expect(hasContentEditable, "los mensajes editables deben usar contenteditable").toBe(true);
    expect(hasEditCommand, "se espera un Command para editar mensajes (p.ej. EditMessageCommand)").toBe(true);
  });
});

describe("Mandatory design patterns: Command, Factory, Memento", () => {
  describe("Command", () => {
    it("declares SendMessageCommand", () => {
      expect(
        /class\s+SendMessageCommand\b/.test(tsText),
        "falta 'class SendMessageCommand' (Command para enviar mensajes)",
      ).toBe(true);
    });

    it("declares EditMessageCommand", () => {
      expect(
        /class\s+EditMessageCommand\b/.test(tsText),
        "falta 'class EditMessageCommand' (Command para editar mensajes)",
      ).toBe(true);
    });

    it("provides a single Executor / invoker that runs Commands", () => {
      const hasExecutor =
        /\b(Executor|CommandExecutor|Invoker)\b[\s\S]{0,200}\b(execute|run)\s*\(/.test(tsText);
      expect(
        hasExecutor,
        "se requiere un Executor/Invoker con un método execute()/run() que reciba Commands",
      ).toBe(true);
    });

    it("includes a Patrón/Problema/Implementación block for Command", () => {
      expect(
        justificationFor("Command"),
        "falta el bloque de justificación 'Patrón: Command / Problema que resuelve: ... / Implementación: ...'",
      ).toBe(true);
    });
  });

  describe("Factory", () => {
    it("declares MessageFactory with a create()", () => {
      const re = /class\s+MessageFactory\b[\s\S]*?\bcreate\s*\(/;
      expect(
        re.test(tsText),
        "falta 'class MessageFactory' con un método estático/instancia create(...)",
      ).toBe(true);
    });

    it("includes a Patrón/Problema/Implementación block for Factory", () => {
      expect(
        justificationFor("Factory"),
        "falta el bloque de justificación 'Patrón: Factory / Problema que resuelve: ... / Implementación: ...'",
      ).toBe(true);
    });
  });

  describe("Memento", () => {
    it("declares a History (Memento) with push() and pop()", () => {
      const hasClass = /class\s+(History|MessagesHistory|Memento)\b/.test(tsText);
      const hasPushPop = /\bpush\s*\([\s\S]{0,400}?\bpop\s*\(/.test(tsText);
      expect(hasClass, "falta 'class History' (o equivalente) para el Memento").toBe(true);
      expect(hasPushPop, "el Memento debe exponer push() y pop()").toBe(true);
    });

    it("includes a Patrón/Problema/Implementación block for Memento", () => {
      expect(
        justificationFor("Memento"),
        "falta el bloque de justificación 'Patrón: Memento / Problema que resuelve: ... / Implementación: ...'",
      ).toBe(true);
    });
  });
});

describe("BEM methodology in CSS", () => {
  const cssFiles = srcFiles.filter((f) => f.endsWith(".css"));
  const css = cssFiles.map((f) => readFileSync(f, "utf8")).join("\n");
  // Recognize BEM both in flat CSS (.block__elem) and PostCSS-nested syntax (&__elem).
  const elementRe = /(\.[a-z][\w-]*__[a-z][\w-]*|&__[a-z][\w-]*)/;
  const modifierRe = /(\.[a-z][\w-]*--[a-z][\w-]*|&--[a-z][\w-]*)/;

  it("CSS files exist under src/", () => {
    expect(cssFiles.length, "debe existir CSS dentro de src/").toBeGreaterThan(0);
  });

  it("uses BEM block__element naming", () => {
    expect(elementRe.test(css), "se esperan clases tipo block__element").toBe(true);
  });

  it("uses BEM block--modifier naming at least once", () => {
    expect(modifierRe.test(css), "se esperan modificadores tipo block--modifier").toBe(true);
  });
});
