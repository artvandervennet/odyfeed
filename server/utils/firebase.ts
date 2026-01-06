// @ts-ignore - firebase-admin is only available at runtime on server
import * as admin from 'firebase-admin'

let initialized = false
let firestoreInstance: any

export function initializeFirebase() {
	if (initialized && firestoreInstance) {
		return firestoreInstance
	}

	if (admin.apps.length === 0) {
		const serviceAccountKeyJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY

		if (!serviceAccountKeyJson) {
			throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable not configured')
		}

		const serviceAccountKey = JSON.parse(serviceAccountKeyJson)

		admin.initializeApp({
			credential: admin.credential.cert(serviceAccountKey),
		})
	}

	firestoreInstance = admin.firestore()
	initialized = true
	return firestoreInstance
}

export function getFirestore() {
	return initializeFirebase()
}

