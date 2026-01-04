import {App, Editor, MarkdownView, Modal, Notice, Plugin, TFile} from 'obsidian';
import {DEFAULT_SETTINGS, CookbookSettings, SampleSettingTab} from "./settings/settings";
import Component from './Component.svelte';
import { mount } from 'svelte';
import { writable } from 'svelte/store';
import CookbookMenu from './CookbookMenu.svelte';

// Remember to rename these classes and interfaces!

export default class CookbookPlugin extends Plugin {
	settings: CookbookSettings;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		this.addRibbonIcon('utensils', 'Cook Book', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new CookbookMenuModal(this.app, this).open();
		});

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status bar text');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-modal-simple',
			name: 'Open modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'replace-selected',
			name: 'Replace selected content',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				editor.replaceSelection('Sample editor command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-modal-complex',
			name: 'Open modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
				return false;
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));

	}

	onunload() {
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<CookbookSettings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	component: any;

	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		// Mount the Svelte component into the modal content element
		this.component = new Component({
			target: contentEl,
			props: { variable: 42 }
		});
	}

	onClose() {
		// Destroy the Svelte component when the modal closes
		if (this.component && typeof this.component.$destroy === 'function') {
			this.component.$destroy();
		}
		const {contentEl} = this;
		contentEl.empty();
	}
}

class CookbookMenuModal extends Modal {
	component: any;
	plugin: CookbookPlugin;

	constructor(app: App, plugin: CookbookPlugin) {
		super(app);
		this.plugin = plugin;
	}

	getSelectedRecipes(): Array<{name: string, path: string}> {
		return this.app.vault.getMarkdownFiles()
			.filter(file => {
				const cache = this.app.metadataCache.getFileCache(file);
				return cache?.frontmatter?.['cook-soon'] === true;
			})
			.map(file => ({ name: file.basename, path: file.path }));
	}

	onOpen() {
		const {contentEl} = this;
		this.titleEl.setText('Cookbook Menu');
		const selectedRecipesStore = writable(this.getSelectedRecipes());
		// Defer mounting to avoid forced reflow
		requestAnimationFrame(() => {
			this.component = mount(CookbookMenu, {
				target: contentEl,
				props: {
					selectedRecipes: selectedRecipesStore,
					onOpenCookbook: () => {
						new Notice('Opening Cookbook...');
						// TODO: Implement open cookbook logic
					},
					onGenerateShoppingList: () => {
						new Notice('Generating shopping list...');
						// TODO: Implement generate shopping list logic
					},
					onToggleCookSoon: async (path: string) => {
						const file = this.app.vault.getAbstractFileByPath(path);
						if (file instanceof TFile) {
							await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
								frontmatter['cook-soon'] = false;
							});
							selectedRecipesStore.update(list => list.filter(r => r.path !== path));
							new Notice(`Deselected ${file.basename}`);
						}
					}
				}
			});
		});
	}

	onClose() {
		// Destroy the Svelte component when the modal closes
		if (this.component && typeof this.component.destroy === 'function') {
			this.component.destroy();
		}
		const {contentEl} = this;
		contentEl.empty();
	}
}
