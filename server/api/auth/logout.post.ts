export default defineEventHandler(async (event) => {
  const { error } = await database(event).auth.signOut()
  dbError(error)
  return { success: true }
})
