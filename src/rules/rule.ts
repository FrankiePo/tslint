/*
 * Copyright 2013 Palantir Technologies, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
*/

/// <reference path='../typescript/src/compiler/syntax/syntaxTree.ts'/>
/// <reference path='../typescript/src/compiler/text/linePosition.ts'/>

module Lint {

    // TODO: Make this immutable somehow
    export interface Rule {
        getName(): string;

        getValue(): any;

        setValue(value: any): void;

        apply(syntaxTree: TypeScript.SyntaxTree): RuleFailure[];
    }

    export class RuleFailurePosition {
        private position: number;
        private lineAndCharacter: TypeScript.LineAndCharacter;

        constructor(position: number, lineAndCharacter: TypeScript.LineAndCharacter) {
            this.position = position;
            this.lineAndCharacter = lineAndCharacter;
        }

        public getPosition() {
            return this.position;
        }

        public getLineAndCharacter() {
            return this.lineAndCharacter;
        }

        public toJson() {
            return {
                position: this.position,
                line: this.lineAndCharacter.line(),
                character: this.lineAndCharacter.character()
            }
        }

        public equals(ruleFailurePosition: RuleFailurePosition) {
            var ll = this.lineAndCharacter;
            var rr = ruleFailurePosition.lineAndCharacter;

            return (this.position === ruleFailurePosition.position &&
                    ll.line() === rr.line() &&
                    ll.character() === rr.character());
        }
    }

    export class RuleFailure {
        private fileName: string;
        private startPosition: Lint.RuleFailurePosition;
        private endPosition: Lint.RuleFailurePosition;
        private failure: string;

        constructor(syntaxTree: TypeScript.SyntaxTree,
                    start: number,
                    end: number,
                    failure: string) {

            this.failure = failure;
            this.fileName = syntaxTree.fileName();
            this.startPosition = this.createFailurePosition(syntaxTree, start);
            this.endPosition = this.createFailurePosition(syntaxTree, end);
        }

        public getFileName() {
            return this.fileName;
        }

        public getStartPosition(): Lint.RuleFailurePosition {
            return this.startPosition;
        }

        public getEndPosition(): Lint.RuleFailurePosition {
            return this.endPosition;
        }

        public getFailure() {
            return this.failure;
        }

        public toJson(): any {
            return {
                name: this.fileName,
                failure: this.failure,
                failurePosition: {
                    start: this.startPosition.toJson(),
                    end: this.endPosition.toJson()
                }
            };
        }

        public equals(ruleFailure: RuleFailure): boolean {
            return (this.failure  === ruleFailure.getFailure() &&
                    this.fileName === ruleFailure.getFileName() &&
                    this.startPosition.equals(ruleFailure.getStartPosition()) &&
                    this.endPosition.equals(ruleFailure.getEndPosition()));
        }

        private createFailurePosition(syntaxTree, position): RuleFailurePosition {
            var lineAndCharacter = syntaxTree.lineMap().getLineAndCharacterFromPosition(position);
            var failurePosition = new RuleFailurePosition(position, lineAndCharacter);
            return failurePosition;
        }
    }

}
