import last from './last';

const INDENT_TYPE_TOP_LEVEL = 'top-level';
const INDENT_TYPE_BLOCK_LEVEL = 'block-level';

/**
 * Manages indentation levels.
 *
 * There are two types of indentation levels:
 *
 * - BLOCK_LEVEL : increased by open-parenthesis
 * - TOP_LEVEL : increased by RESERVED_TOP_LEVEL words
 */
export default class Indentation {
  public indentTypes: string[] = [];
  /**
   * @param {string} indent Indent value, default is "  " (2 spaces)
   */
  constructor(public indent?: string) {
    this.indent = indent || '  ';
  }

  /**
   * Returns current indentation string.
   * @return {string}
   */
  getIndent() {
    return new Array(this.indentTypes.length).fill(this.indent).join('');
  }

  /**
   * Increases indentation by one top-level indent.
   */
  increaseTopLevel() {
    this.indentTypes.push(INDENT_TYPE_TOP_LEVEL);
  }

  /**
   * Increases indentation by one block-level indent.
   */
  increaseBlockLevel() {
    this.indentTypes.push(INDENT_TYPE_BLOCK_LEVEL);
  }

  /**
   * Decreases indentation by one top-level indent.
   * Does nothing when the previous indent is not top-level.
   */
  decreaseTopLevel() {
    if (last(this.indentTypes) === INDENT_TYPE_TOP_LEVEL) {
      this.indentTypes.pop();
    }
  }

  /**
   * Decreases indentation by one block-level indent.
   * If there are top-level indents within the block-level indent,
   * throws away these as well.
   */
  decreaseBlockLevel() {
    while (this.indentTypes.length > 0) {
      const type = this.indentTypes.pop();
      if (type !== INDENT_TYPE_TOP_LEVEL) {
        break;
      }
    }
  }

  resetIndentation() {
    this.indentTypes = [];
  }
}
