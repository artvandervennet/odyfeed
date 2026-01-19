export interface ValidationRule<T = string> {
	validate: (value: T) => boolean
	message: string
}

export interface ValidationResult {
	isValid: boolean
	error: string
}

export const useFormValidation = function () {
	const validateUsername = function (username: string): ValidationResult {
		if (!username) {
			return { isValid: false, error: 'Username is required' }
		}

		const usernameRegex = /^[a-z0-9_-]+$/
		if (!usernameRegex.test(username)) {
			return {
				isValid: false,
				error: 'Username must contain only lowercase letters, numbers, hyphens, and underscores',
			}
		}

		return { isValid: true, error: '' }
	}

	const validateUrl = function (url: string): ValidationResult {
		if (!url) {
			return { isValid: false, error: 'URL is required' }
		}

		try {
			const parsed = new URL(url)
			if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
				return { isValid: false, error: 'URL must use http or https protocol' }
			}
			return { isValid: true, error: '' }
		} catch {
			return { isValid: false, error: 'Please enter a valid URL' }
		}
	}

	const validateRequired = function (value: string, fieldName = 'Field'): ValidationResult {
		if (!value || !value.trim()) {
			return { isValid: false, error: `${fieldName} is required` }
		}
		return { isValid: true, error: '' }
	}

	return {
		validateUsername,
		validateUrl,
		validateRequired,
	}
}
