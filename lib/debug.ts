export const debugQuery = async (query: Promise<any>, operation: string) => {
  try {
    const result = await query
    console.log(`✅ ${operation} exitoso:`, result)
    return result
  } catch (error) {
    console.error(`❌ Error en ${operation}:`, error)
    throw error
  }
}