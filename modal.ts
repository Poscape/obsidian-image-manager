import { App, Modal, Setting } from "obsidian";

export class SampleModal extends Modal {
	// 在 Class 的类定义中，你需要初始化，也就是 Constructor ，关于类的初始化，看这个文章可以得到的比较好的解释：[JavaScript(ES6) - Class](https://www.jianshu.com/p/7e102e095171)
    // 下边将 app super 为所继承的类的原有app，也就是我们的 obsidian app 本体。
	constructor(app: App) {
		super(app);
	}

	// 打开 Model 时，内部执行的函数步骤
    // 将 contentEl 赋值为 this ，也即当前的 model 层，一般来说，this 都是单指类本体，除非你在 constructor 中引入它指向其它对象。
    // contentEl 调用 obsidian 封装好的方法， setText 为 woah，你可以试着修改这个为 Hello World。
	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	// 关闭 Model 的时候，你需要将对应的 contentEl 清空。
    // 所以调用 contentEl.empty() 方法。
	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

export class InsertTableModal extends Modal {
    onSubmit: (line: number, column: number) => void;
    line: number;
    column: number;

	constructor(
        app: App,
        onSubmit: (line: number, column: number) => void
    ) {
		super(app);
        this.onSubmit = onSubmit;
        this.line = 0;
        this.column = 0;
	}

	onOpen() {
		const {contentEl} = this;
        contentEl.createEl("h1", { text: "Insert Table" });

        new Setting(contentEl).setName("Line").addText((text) =>
            text.onChange((value) => {
                this.line = Number(value); 
            })
        );

        new Setting(contentEl).setName("Column").addText((text) =>
            text.onChange((value) => {
                this.column = Number(value);
            })
        );

        new Setting(contentEl).addButton((btn) =>
        btn
            .setButtonText("Insert")
            .setCta()
            .onClick(() => {
                this.close();
                this.onSubmit(this.line, this.column);
            })
        );
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}