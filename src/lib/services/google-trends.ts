import { spawn } from 'child_process'
import path from 'path'

interface TrendData {
  keyword: string
  interest: number
  timestamp: Date
}

export async function getGoogleTrends(keywords: string[]): Promise<TrendData[]> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(process.cwd(), 'scripts', 'get_trends.py')
    const pythonProcess = spawn('python3', [pythonScript, JSON.stringify(keywords)])
    
    let output = ''
    let error = ''
    
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString()
    })
    
    pythonProcess.stderr.on('data', (data) => {
      error += data.toString()
    })
    
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python script failed: ${error}`))
        return
      }
      
      try {
        const trends = JSON.parse(output)
        resolve(trends)
      } catch (e) {
        reject(new Error('Failed to parse Python script output'))
      }
    })
  })
} 