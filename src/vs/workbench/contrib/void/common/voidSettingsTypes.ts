
/*--------------------------------------------------------------------------------------
 *  Copyright 2025 Glass Devtools, Inc. All rights reserved.
 *  Licensed under the Apache License, Version 2.0. See LICENSE.txt for more information.
 *--------------------------------------------------------------------------------------*/

import { defaultModelsOfProvider, defaultProviderSettings, ModelOverrides } from './modelCapabilities.js';
import { ToolApprovalType } from './toolsServiceTypes.js';
import { VoidSettingsState } from './voidSettingsService.js'


type UnionOfKeys<T> = T extends T ? keyof T : never;



export type ProviderName = keyof typeof defaultProviderSettings
export const providerNames = Object.keys(defaultProviderSettings) as ProviderName[]

export const localProviderNames = ['ollama'] satisfies ProviderName[] // all local names
export const nonlocalProviderNames = providerNames.filter((name) => !(localProviderNames as string[]).includes(name)) // all non-local names

type CustomSettingName = UnionOfKeys<typeof defaultProviderSettings[ProviderName]>
type CustomProviderSettings<providerName extends ProviderName> = {
	[k in CustomSettingName]: k extends keyof typeof defaultProviderSettings[providerName] ? string : undefined
}
export const customSettingNamesOfProvider = (providerName: ProviderName) => {
	return Object.keys(defaultProviderSettings[providerName]) as CustomSettingName[]
}



export type VoidStatefulModelInfo = { // <-- STATEFUL
	modelName: string,
	type: 'default' | 'autodetected' | 'custom';
	isHidden: boolean, // whether or not the user is hiding it (switched off)
}  // TODO!!! eventually we'd want to let the user change supportsFIM, etc on the model themselves



type CommonProviderSettings = {
	_didFillInProviderSettings: boolean | undefined, // undefined initially, computed when user types in all fields
	models: VoidStatefulModelInfo[],
}

export type SettingsAtProvider<providerName extends ProviderName> = CustomProviderSettings<providerName> & CommonProviderSettings

// part of state
export type SettingsOfProvider = {
	[providerName in ProviderName]: SettingsAtProvider<providerName>
}


export type SettingName = keyof SettingsAtProvider<ProviderName>

type DisplayInfoForProviderName = {
	title: string,
	desc?: string,
}

export const displayInfoOfProviderName = (providerName: ProviderName): DisplayInfoForProviderName => {
       if (providerName === 'openAI') {
               return { title: 'OpenAI', }
       }
       else if (providerName === 'ollama') {
               return { title: 'Ollama', }
       }

	throw new Error(`descOfProviderName: Unknown provider name: "${providerName}"`)
}

export const subTextMdOfProviderName = (providerName: ProviderName): string => {
       if (providerName === 'openAI') return 'Get your [API Key here](https://platform.openai.com/api-keys).'
       if (providerName === 'ollama') return 'Read more about custom [Endpoints here](https://github.com/ollama/ollama/blob/main/docs/faq.md#how-can-i-expose-ollama-on-my-network).'

	throw new Error(`subTextMdOfProviderName: Unknown provider name: "${providerName}"`)
}

type DisplayInfo = {
	title: string;
	placeholder: string;
	isPasswordField?: boolean;
}
export const displayInfoOfSettingName = (providerName: ProviderName, settingName: SettingName): DisplayInfo => {
	if (settingName === 'apiKey') {
		return {
			title: 'API Key',

			// **Please follow this convention**:
			// The word "key..." here is a placeholder for the hash. For example, sk-ant-key... means the key will look like sk-ant-abcdefg123...
			placeholder: providerName === 'anthropic' ? 'sk-ant-key...' : // sk-ant-api03-key
				providerName === 'openAI' ? 'sk-proj-key...' :
					providerName === 'deepseek' ? 'sk-key...' :
						providerName === 'openRouter' ? 'sk-or-key...' : // sk-or-v1-key
							providerName === 'gemini' ? 'AIzaSy...' :
								providerName === 'groq' ? 'gsk_key...' :
									providerName === 'openAICompatible' ? 'sk-key...' :
										providerName === 'xAI' ? 'xai-key...' :
											providerName === 'mistral' ? 'api-key...' :
												providerName === 'googleVertex' ? 'AIzaSy...' :
													providerName === 'microsoftAzure' ? 'key-...' :
														'',

			isPasswordField: true,
		}
	}
	else if (settingName === 'endpoint') {
		return {
			title: providerName === 'ollama' ? 'Endpoint' :
				providerName === 'vLLM' ? 'Endpoint' :
					providerName === 'lmStudio' ? 'Endpoint' :
						providerName === 'openAICompatible' ? 'baseURL' : // (do not include /chat/completions)
							providerName === 'googleVertex' ? 'baseURL' :
								providerName === 'microsoftAzure' ? 'baseURL' :
									providerName === 'liteLLM' ? 'baseURL' :
										'(never)',

			placeholder: providerName === 'ollama' ? defaultProviderSettings.ollama.endpoint
				: providerName === 'vLLM' ? defaultProviderSettings.vLLM.endpoint
					: providerName === 'openAICompatible' ? 'https://my-website.com/v1'
						: providerName === 'lmStudio' ? defaultProviderSettings.lmStudio.endpoint
							: providerName === 'liteLLM' ? 'http://localhost:4000'
								: '(never)',


		}
	}
	else if (settingName === 'headersJSON') {
		return { title: 'Custom Headers', placeholder: '{ "X-Request-Id": "..." }' }
	}
	else if (settingName === 'region') {
		// vertex only
		return {
			title: 'Region',
			placeholder: providerName === 'googleVertex' ? defaultProviderSettings.googleVertex.region
				: ''
		}
	}
	else if (settingName === 'azureApiVersion') {
		// azure only
		return {
			title: 'API Version',
			placeholder: providerName === 'microsoftAzure' ? defaultProviderSettings.microsoftAzure.azureApiVersion
				: ''
		}
	}
	else if (settingName === 'project') {
		return {
			title: providerName === 'microsoftAzure' ? 'Resource'
				: providerName === 'googleVertex' ? 'Project'
					: '',
			placeholder: providerName === 'microsoftAzure' ? 'my-resource'
				: providerName === 'googleVertex' ? 'my-project'
					: ''

		}

	}
	else if (settingName === '_didFillInProviderSettings') {
		return {
			title: '(never)',
			placeholder: '(never)',
		}
	}
	else if (settingName === 'models') {
		return {
			title: '(never)',
			placeholder: '(never)',
		}
	}

	throw new Error(`displayInfo: Unknown setting name: "${settingName}"`)

}




const defaultCustomSettings: Record<CustomSettingName, undefined> = {
	apiKey: undefined,
	endpoint: undefined,
	region: undefined, // googleVertex
	project: undefined,
	azureApiVersion: undefined,
	headersJSON: undefined,
}


const modelInfoOfDefaultModelNames = (defaultModelNames: string[]): { models: VoidStatefulModelInfo[] } => {
	return {
		models: defaultModelNames.map((modelName, i) => ({
			modelName,
			type: 'default',
			isHidden: defaultModelNames.length >= 10, // hide all models if there are a ton of them, and make user enable them individually
		}))
	}
}

// used when waiting and for a type reference
export const defaultSettingsOfProvider: SettingsOfProvider = {
       // anthropic: {
       //      ...defaultCustomSettings,
       //      ...defaultProviderSettings.anthropic,
       //      ...modelInfoOfDefaultModelNames(defaultModelsOfProvider.anthropic),
       //      _didFillInProviderSettings: undefined,
       // },
       openAI: {
               ...defaultCustomSettings,
               ...defaultProviderSettings.openAI,
               ...modelInfoOfDefaultModelNames(defaultModelsOfProvider.openAI),
               _didFillInProviderSettings: undefined,
       },
       // deepseek: { ... },
       // gemini: { ... },
       // xAI: { ... },
       // mistral: { ... },
       // liteLLM: { ... },
       // lmStudio: { ... },
       // groq: { ... },
       // openRouter: { ... },
       // openAICompatible: { ... },
	ollama: { // aggregator (serves models from multiple providers)
		...defaultCustomSettings,
		...defaultProviderSettings.ollama,
		...modelInfoOfDefaultModelNames(defaultModelsOfProvider.ollama),
		_didFillInProviderSettings: undefined,
	},
// // vLLM: { // aggregator (serves models from multiple providers)
// 		...defaultCustomSettings,
// 		...defaultProviderSettings.vLLM,
// 		...modelInfoOfDefaultModelNames(defaultModelsOfProvider.vLLM),
// 		_didFillInProviderSettings: undefined,
// 	},
// 	googleVertex: { // aggregator (serves models from multiple providers)
// 		...defaultCustomSettings,
// 		...defaultProviderSettings.googleVertex,
// 		...modelInfoOfDefaultModelNames(defaultModelsOfProvider.googleVertex),
// 		_didFillInProviderSettings: undefined,
// 	},
// 	microsoftAzure: { // aggregator (serves models from multiple providers)
// 		...defaultCustomSettings,
// 		...defaultProviderSettings.microsoftAzure,
// 		...modelInfoOfDefaultModelNames(defaultModelsOfProvider.microsoftAzure),
// 		_didFillInProviderSettings: undefined,
// 	},
}


export type ModelSelection = { providerName: ProviderName, modelName: string }

export const modelSelectionsEqual = (m1: ModelSelection, m2: ModelSelection) => {
	return m1.modelName === m2.modelName && m1.providerName === m2.providerName
}

// this is a state
export const featureNames = ['Chat', 'Ctrl+K', 'Autocomplete', 'Apply'] as const
export type ModelSelectionOfFeature = Record<(typeof featureNames)[number], ModelSelection | null>
export type FeatureName = keyof ModelSelectionOfFeature

export const displayInfoOfFeatureName = (featureName: FeatureName) => {
	// editor:
	if (featureName === 'Autocomplete')
		return 'Autocomplete'
	else if (featureName === 'Ctrl+K')
		return 'Quick Edit'
	// sidebar:
	else if (featureName === 'Chat')
		return 'Chat'
	else if (featureName === 'Apply')
		return 'Apply'
	else
		throw new Error(`Feature Name ${featureName} not allowed`)
}


// the models of these can be refreshed (in theory all can, but not all should)
export const refreshableProviderNames = localProviderNames
export type RefreshableProviderName = typeof refreshableProviderNames[number]

// models that come with download buttons
export const hasDownloadButtonsOnModelsProviderNames = ['ollama'] as const satisfies ProviderName[]





// use this in isFeatuerNameDissbled
export const isProviderNameDisabled = (providerName: ProviderName, settingsState: VoidSettingsState) => {

	const settingsAtProvider = settingsState.settingsOfProvider[providerName]
	const isAutodetected = (refreshableProviderNames as string[]).includes(providerName)

	const isDisabled = settingsAtProvider.models.length === 0
	if (isDisabled) {
		return isAutodetected ? 'providerNotAutoDetected' : (!settingsAtProvider._didFillInProviderSettings ? 'notFilledIn' : 'addModel')
	}
	return false
}

export const isFeatureNameDisabled = (featureName: FeatureName, settingsState: VoidSettingsState) => {
	// if has a selected provider, check if it's enabled
	const selectedProvider = settingsState.modelSelectionOfFeature[featureName]

	if (selectedProvider) {
		const { providerName } = selectedProvider
		return isProviderNameDisabled(providerName, settingsState)
	}

	// if there are any models they can turn on, tell them that
	const canTurnOnAModel = !!providerNames.find(providerName => settingsState.settingsOfProvider[providerName].models.filter(m => m.isHidden).length !== 0)
	if (canTurnOnAModel) return 'needToEnableModel'

	// if there are any providers filled in, then they just need to add a model
	const anyFilledIn = !!providerNames.find(providerName => settingsState.settingsOfProvider[providerName]._didFillInProviderSettings)
	if (anyFilledIn) return 'addModel'

	return 'addProvider'
}







export type ChatMode = 'agent' | 'gather' | 'normal'


export type GlobalSettings = {
	autoRefreshModels: boolean;
	aiInstructions: string;
	enableAutocomplete: boolean;
	syncApplyToChat: boolean;
	enableFastApply: boolean;
	chatMode: ChatMode;
	autoApprove: { [approvalType in ToolApprovalType]?: boolean };
	showInlineSuggestions: boolean;
	includeToolLintErrors: boolean;
	isOnboardingComplete: boolean;
}

export const defaultGlobalSettings: GlobalSettings = {
	autoRefreshModels: true,
	aiInstructions: '',
	enableAutocomplete: false,
	syncApplyToChat: true,
	enableFastApply: true,
	chatMode: 'agent',
	autoApprove: {},
	showInlineSuggestions: true,
	includeToolLintErrors: true,
	isOnboardingComplete: false,
}

export type GlobalSettingName = keyof GlobalSettings
export const globalSettingNames = Object.keys(defaultGlobalSettings) as GlobalSettingName[]












export type ModelSelectionOptions = {
	reasoningEnabled?: boolean;
	reasoningBudget?: number;
	reasoningEffort?: string;
}

export type OptionsOfModelSelection = {
	[featureName in FeatureName]: Partial<{
		[providerName in ProviderName]: {
			[modelName: string]: ModelSelectionOptions | undefined
		}
	}>
}





export type OverridesOfModel = {
	[providerName in ProviderName]: {
		[modelName: string]: Partial<ModelOverrides> | undefined
	}
}


const overridesOfModel = {} as OverridesOfModel
for (const providerName of providerNames) { overridesOfModel[providerName] = {} }
export const defaultOverridesOfModel = overridesOfModel
