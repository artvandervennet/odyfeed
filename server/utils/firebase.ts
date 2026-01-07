import admin from 'firebase-admin'

let initialized = false
let firestoreInstance: admin.firestore.Firestore | null = null

export function initializeFirebase() {
	if (initialized && firestoreInstance) {
		return firestoreInstance
	}

	try {
		// Check if Firebase Admin SDK is already initialized
		const existingApp = admin.apps?.length ? admin.apps[0] : null

		if (existingApp) {
			firestoreInstance = admin.firestore(existingApp)
			initialized = true
			return firestoreInstance
		}

		// Get service account key from environment
		const serviceAccountKeyJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY

		if (!serviceAccountKeyJson) {
			throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable not configured')
		}

		const serviceAccountKey = JSON.parse(serviceAccountKeyJson)

		const app = admin.initializeApp({
			credential: admin.credential.cert(serviceAccountKey),
		})

		firestoreInstance = admin.firestore(app)
		initialized = true
		return firestoreInstance
	} catch (error) {
		console.error('Failed to initialize Firebase:', error)
		throw error
	}
}

export function getFirestore(): admin.firestore.Firestore {
	return initializeFirebase()!
}

