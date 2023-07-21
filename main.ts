// 导入你所需要的包
import { App, Editor, FileSystemAdapter, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile, WorkspaceLeaf } from 'obsidian';
import { SampleModal, InsertTableModal } from './modal';
import { SampleSettingTab } from './settings';
import { CSVView, VIEW_TYPE_CSV } from "./view"

// Remember to rename these classes and interfaces!
// 配置你的插件设置面板所用的参数的类型
// 你需要在这里预先定义你的设置对应的字符串类型，一般来说只有这三种类型，boolean\string\number
interface MyPluginSettings {
	mySetting: string;
}

// 配置你的插件设置面板所有的参数的基础值
// 当你想要加多一个设置默认值的时候，例如 cook: '白切鸡'
// 则同样需要在上边的接口（interface）中加入相关的定义
const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class MyPlugin extends Plugin {
	// 声明公共字段，抄就是了
	settings: MyPluginSettings;

	// 基础方法，插件加载后的方法在这里定义
	async onload() {
		console.log('loading plugin');
		// clear console
		console.clear();
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		// 直译：这里会在左边的 Ribbon 栏创建一个新的按钮
		// this.addRibbonIcon 指的是调用了 [[Obsidian]] 给插件暴露出来的 addRibbonIcon 函数，因为它会返回对应的 HTMLElement 元素，你可以将它赋值给一个变量。你创建的时候你需要传入三个值
		// 第一个是图标名，你可以从这里找到现在官方内置的图标集：[Lucide](https://lucide.dev/) 或者社区分享的列表： [Discord](https://discord.com/channels/686053708261228577/840286264964022302/968248588641665075)
		// 第二个是当你鼠标悬浮在图标上的时候显示的名称，这里是 Sample Plugin 
		// 第三个则是调用的函数，一般来说，你也可以考虑直接在里面更改这个 new Notice(...) 为其它的函数 
		
		const ribbonIconEl = this.addRibbonIcon('aperture', 'Image Manager', async (evt: MouseEvent) => {
			// Called when the user clicks the icon.
		
			new Notice('Hello World!');
		
			let imgFileDict = new Dictionary<string, TFile>();
		
			const imageExtensions: Set<string> = new Set(['jpeg', 'jpg', 'png', 'gif', 'svg', 'bmp']);
		
			// {name: TFile} img dict
			let allFiles: TFile[] = app.vault.getFiles();
			for (let i = 0; i < allFiles.length; i++) {
				if (!['md', 'canvas'].includes(allFiles[i].extension)) {
					// Only images
					if (imageExtensions.has(allFiles[i].extension.toLowerCase())) {
						imgFileDict.set(allFiles[i].name, allFiles[i]);
					}
				}
			}
			console.log(imgFileDict)
			var resolvedLinks = app.metadataCache.resolvedLinks;
			if (resolvedLinks) {
				for (const [mdFileName, links] of Object.entries(resolvedLinks)) {
					console.log('---------------------------------')
					console.log("### " + mdFileName + " ###")
					console.log(links)
					console.log("->")
		
					// if length == 0, continue
					if (Object.keys(links).length == 0) {
						console.log("links length == 0")
						continue
					}
		
					var mdBaseName = ''
					var mdReg = mdFileName.match(/\/([^\/]+)\.md$/)
					if (mdReg) {
						mdBaseName = mdReg[1]
						console.log("match: " + mdBaseName)
					} else {
						console.log("mdBaseName not match")
						continue
					}
					
					let isCheck = false
					for (const [filePath, nr] of Object.entries(resolvedLinks[mdFileName])) {

						if (!(filePath as String).endsWith('.md')) {
							var imgReg = filePath.match(/\/([^\/]+)$/);
							if (imgReg) {
								var imgFileName = imgReg[1];
								if (imgFileDict.hasKey(imgFileName)) {
									var file = imgFileDict.get(imgFileName);
									if (file && file != null && file != undefined) {
										if (!isCheck) {
											const exists = await this.app.vault.adapter.exists("/img/" + mdBaseName);
											if (!exists) {
												console.log('dir not exists: ' + "/img/" + mdBaseName)
												await this.app.vault.adapter.mkdir('/img/' + mdBaseName);
											} else {
												console.log('dir exists: ' + "/img/" + mdBaseName)
											}
											isCheck = true
										}
										
										const exists2 = await this.app.vault.adapter.exists('/img/' + mdBaseName + '/' + imgFileName);
										if (!exists2) {
											await this.app.vault.rename(file, '/img/' + mdBaseName + '/' + imgFileName);
											console.log('rename to:' + '/img/' + mdBaseName + '/' + imgFileName);
										} else {
											console.log('img exists: ' + '/img/' + mdBaseName + '/' + imgFileName);
										}
									}
								}
							}
						}
					}
				}
				console.log('---------------------------------')
			}

			// check empty dir in img/ , and delete it
			

		})

		// Perform additional things with the ribbon
		// 给上述你获取的 HTMLElement 加上 css 的 Class
		ribbonIconEl.addClass('my-plugin-ribbon-class');

	// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
	// 同理，这里是在状态栏上添加内容和设置对应的文本。
	const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('🩷🧡💛💚🩵💙');

		// This adds a simple command that can be triggered anywhere
		// 这个会创建一个在 Obsidian 中任意地方都可以触发的命令
		// id 代表 Obsidian 用来作为唯一标识的 id，当你的命令 id 和别人的一样时候，会出现触发问题
		// name 代表你在快捷键列表/命令列表中看得到的那个文本串
		// callback 回调你的函数，当触发了命令后，你希望执行的对应方法，例如，点击命令后，直接 unload 插件（不要）
		this.addCommand({
		id: 'open-sample-modal-simple',
		name: 'Open sample modal (simple)',
		callback: () => {
			// 这里代表的是新建一个 modal 页面，然后直接打开。
			// 自然，你需要定义 modal 页面中要放点什么，这个则是依赖于另一个 model 类来定义，每一个插件可以创建无数名称不同的 model 类，只要你喜欢。
			new SampleModal(this.app).open();
		}
	});

// This adds an editor command that can perform some operation on the current editor instance
// 与上方类似的是，这个是专门应用于编辑器内部的命令，因为 obsidian 采用的 codemirrorJS 如果你不知道怎么获取当前的 editor 的话，会胡乱执行命令的，所以 licat 单独封装了这个回调，避免出现奇奇怪怪的问题。 
this.addCommand({
	id: 'sample-editor-command',
	name: 'Sample editor command',
	// 区别点在于这里，上边的直接是 callback ，这里则是 editorCallback 特指 Editor（编辑器）
	// 其中 editor: Editor 以及 view: MarkdownView 则是指回调函数可用的参数，而 editor: Editor 这种形式是指类型限定，需要了解的可以搜索 Typescript 类型限定。
	editorCallback: (editor: Editor, view: MarkdownView) => {
		// 这里执行的所有内容，都是当前的可编辑页面中执行
		// 例如此处的 editor.getSelection 指的是调用了 editor 执行获取当前选中的内容的方法
		console.log(editor.getSelection());
		editor.replaceSelection('Sample Editor Command');
	}
});

// This adds a complex command that can check whether the current state of the app allows execution of the command
// 用来限定某一个命令是否能在当前环境中启动，例如上述的编辑器命令，如果当前采用的不是编辑模式的话，可以让它返回不可启动等。
this.addCommand({
	id: 'open-sample-modal-complex',
	name: 'Open sample modal (complex)',
	// 利用 checkCallback 来判断当前的命令是否可以展示。
	checkCallback: (checking: boolean) => {
		// Conditions to check
		// 判断条件，获取当前 this.app (注意，在 0.14.6 版本后，你可以不加上 this 也能获取到我们的 app)，也即可以直接采用 app.workspace 来获取当前的 Workspace 
		// workspace.getActiveViewOfType 代表的是获取当前页面的类型，而且指定为 MarkdownView ，如果当前页面不是编辑器页面，那就返回 null 。
		const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (markdownView) {
			// If checking is true, we're simply "checking" if the command can be run.
			// If checking is false, then we want to actually perform the operation.
			// 上述获取 MarkdownView 后，会在当前的命令面板中展示我们的命令，但是接下来会将 Checking 设置为 false 因此，当你启动的时候就可以执行下边的命令。
			if (!checking) {
				// 这里代表的是新建一个 modal 页面，然后直接打开。
				new SampleModal(this.app).open();
			}

			// This command will only show up in Command Palette when the check function returns true
			// 这里返回的真则会让我们的命令在当前情况下显示。
			return true;
		}
	}
});

// This adds a settings tab so the user can configure various aspects of the plugin
// 当插件加载的时候，添加一个插件面板给自己
// new SampleSettingTab 指的是针对当前的 app 和 插件本身（这里的 this 引用的是我们插件这个类本体），创建一个新的插件面板。
// 注意，0.14.6 后你还是可以不再引入 this.app 而是用 app 代替。
this.addSettingTab(new SampleSettingTab(this.app, this));

// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
// Using this function will automatically remove the event listener when this plugin is disabled.
// 用来注册 DOM 监控事件
// 如果你用这个方案，当插件被关闭的时候可以自动去除这个事件监控。
// document 指的是监控对象，就是 Obsidian 本体的视图层
// click 指的是点击行为，其它可以监控的方法包括：[EventTarget.addEventListener() - Web API 接口参考 | MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/addEventListener)
// 后续又是一个熟悉的调用函数、执行方法
this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
	console.log('click', evt);
});

// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
// 下方则是注册一个定时器，用来定时执行某些函数，当关闭插件的时候也会自动注销掉。
this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));

// 在 Plugin 类下监听事件
this.registerEvent(
	this.app.workspace.on("file-menu", (menu, file, source) => {
		if (source !== "file-explorer-context-menu") {
			// 事件来源，这里的逻辑是，如果来源不是左侧的文件树目录菜单，就返回，事实上来源有很多种，可以去 obsidian 库下查
			return;
		}
		menu
			.addSeparator()
			.addItem((item) => {
				item
					.setTitle(`右键菜单项文本`)
					.setIcon('右键菜单项图标，可以用 plus-circle')
					.setSection("action")
					.onClick(async (_) => {
						// 监听逻辑
						// ...
					});
			});
	})
);

this.registerEvent(
	this.app.workspace.on("editor-menu", (menu, editor, info) => {
		menu
			.addSeparator()
			.addItem((item) => {
				item
					.setTitle('💝')
					.setIcon('picture')
					.setSection("action")
					.onClick(async (_) => {
						console.log(editor.getSelection());
					});
			});
	})
);

this.registerEvent(
	this.app.workspace.on("editor-menu", (menu, editor, info) => {
		menu
			.addSeparator()
			.addItem((item) => {
				item
					.setTitle('插入表格')
					.setIcon('picture')
					.setSection("action")
					.onClick(async (_) => {
						const onSubmit = (line: number, column: number) => {
							console.log(line, column);
							var text = `\n|${"   |".repeat(column)}\n${"|---".repeat(column)}|\n`;
							text += `|${"   |".repeat(column)}\n`.repeat(line);
							editor.replaceRange(text, editor.getCursor());
						};
						new InsertTableModal(this.app, onSubmit).open();
					});
			});
	})
);

this.registerView(
	VIEW_TYPE_CSV,
	(leaf: WorkspaceLeaf) => new CSVView(leaf)
);
this.registerExtensions(["csv"], VIEW_TYPE_CSV);
	}

// 基础方法，插件卸载后的方法在这里定义
onunload() {
	console.log('unloading plugin');
}

	// 可选方法，加载你的插件设置内容
	async loadSettings() {
	this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
}

	// 可选方法，保存你的插件设置内容
	async saveSettings() {
	await this.saveData(this.settings);
}
}

class Dictionary<K, V> {
	private table: Map<K, V>;

	constructor() {
		this.table = new Map();
	}

	/**
	 * @description: 设置键值对
	 * @param {K} key
	 * @param {V} value
	 * @return {boolean}
	 */
	set(key: K, value: V): boolean {
		this.table.set(key, value);
		return true;
	}

	/**
	 * @description: 根据键取值
	 * @param {K} key
	 * @return {V}
	 */
	get(key: K): V | undefined {
		return this.table.get(key);
	}

	/**
	 * @description: 返回是否有此键
	 * @param {K} key
	 * @return {boolean}
	 */
	hasKey(key: K): boolean {
		return this.table.has(key);
	}

	/**
	 * @description: 移除键值对
	 * @param {K} key
	 * @return {boolean}
	 */
	remove(key: K): boolean {
		return this.table.delete(key);
	}

	/**
	 * @description: 返回值数组
	 * @return {Array<V>}
	 */
	values(): V[] {
		return Array.from(this.table.values());
	}

	/**
	 * @description: 返回键数组
	 * @return {Array<K>}
	 */
	keys(): K[] {
		return Array.from(this.table.keys());
	}

	/**
	 * @description: 返回键值对数组
	 * @return {Array<K, V>}
	 */
	keyValues(): [K, V][] {
		return Array.from(this.table.entries());
	}

	/**
	 * @description: 迭代整个字典
	 * @param {function} callbackFn
	 */
	forEach(callbackFn: (key: K, value: V) => any) {
		const valuePairs = this.keyValues();
		for (let i = 0; i < valuePairs.length; i++) {
			// callbackFn 返回 false 时要终止迭代
			if (callbackFn(valuePairs[i][0], valuePairs[i][1]) === false) {
				break;
			}
		}
	}

	/**
	 * @description: 是否为空
	 * @return {boolean}
	 */
	isEmpty(): boolean {
		return this.size() === 0;
	}

	/**
	 * @description: 字典的大小
	 * @return {number}
	 */
	size(): number {
		return this.table.size;
	}

	/**
	 * @description: 清空字典
	 */
	clear() {
		this.table.clear();
	}

	/**
	 * @description: 替代默认toString
	 * @return {string}
	 */
	toString(): string {
		if (this.isEmpty()) {
			return '';
		}

		let objStringList = [];
		// 迭代 table
		for (const [key, value] of this.table) {
			objStringList.push(`[${key}: ${value}]`);
		}
		return objStringList.join(',');
	}
}