import { runFullMigration } from '~~/server/utils/migrate'

export default defineEventHandler(async (event) => {
	const query = getQuery(event)
	const dryRun = query.dryRun === 'true'

	if (dryRun) {
		return {
			message: 'Dry run mode - no data was migrated. Run without ?dryRun=true to perform actual migration.',
			note: 'To execute the migration, call this endpoint with ?dryRun=false or no query parameter'
		}
	}

	try {
		const results = await runFullMigration()
		return {
			success: true,
			message: 'Migration completed successfully',
			results: results
		}
	} catch (error) {
		return createError({
			statusCode: 500,
			statusMessage: 'Migration failed',
			data: {
				error: (error as Error).message
			}
		})
	}
})

