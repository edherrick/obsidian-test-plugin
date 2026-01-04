import {App, PluginSettingTab, Setting} from "obsidian";
import {FolderSuggest} from "./suggesters/FolderSuggester";
import CookbookPlugin from "../main";

export interface CookbookSettings {
	recipeFolder: string;
}

export const DEFAULT_SETTINGS: CookbookSettings = {
	recipeFolder: ''
}

export class SampleSettingTab extends PluginSettingTab {
	plugin: CookbookPlugin;

	constructor(app: App, plugin: CookbookPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Recipe folder location')
			.setDesc('File path to the root folder containing your recipes.')
			.addSearch((cb) => {
                new FolderSuggest(this.app, cb.inputEl);
                cb.setPlaceholder("Example: folder1/folder2")
                    .setValue(this.plugin.settings.recipeFolder)
                    .onChange((new_folder) => {
                        // Trim folder and Strip ending slash if there
                        new_folder = new_folder.trim()
                        new_folder = new_folder.replace(/\/$/, "");

                        this.plugin.settings.recipeFolder = new_folder;
                        this.plugin.saveSettings();
                    });
                // @ts-ignore
                cb.containerEl.addClass("cookbook-folder-search");
            });
	}
}
