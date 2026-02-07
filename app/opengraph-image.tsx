import { ImageResponse } from 'next/og'
import { readFile } from 'fs/promises'
import { join } from 'path'

export const runtime = 'nodejs'
export const alt = 'ThoughtMap - AI-Powered Learning Platform'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  const imageData = await readFile(
    join(process.cwd(), 'public/images/expedition_with_trails_example.jpeg')
  )
  const base64Image = `data:image/jpeg;base64,${imageData.toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          backgroundColor: '#0f0f23',
        }}
      >
        {/* Screenshot background */}
        <img
          src={base64Image}
          width={1200}
          height={630}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'top left',
          }}
        />

        {/* Bottom gradient overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '180px',
            background: 'linear-gradient(to top, rgba(15,15,35,0.95), rgba(15,15,35,0.7), transparent)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            padding: '0 48px 36px 48px',
          }}
        >
          {/* Branding */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div
              style={{
                fontSize: '42px',
                fontWeight: 800,
                color: 'white',
                letterSpacing: '-0.5px',
              }}
            >
              ThoughtMap
            </div>
            <div
              style={{
                fontSize: '20px',
                color: 'rgba(255,255,255,0.75)',
                fontWeight: 400,
              }}
            >
              AI-Powered Learning That Actually Works
            </div>
          </div>

          {/* URL */}
          <div
            style={{
              fontSize: '18px',
              color: 'rgba(255,255,255,0.6)',
              fontWeight: 500,
            }}
          >
            thoughtmap.space
          </div>
        </div>

        {/* Beta badge */}
        <div
          style={{
            position: 'absolute',
            top: '24px',
            right: '24px',
            background: '#6366f1',
            color: 'white',
            padding: '8px 24px',
            borderRadius: '24px',
            fontSize: '15px',
            fontWeight: 700,
            letterSpacing: '1.5px',
          }}
        >
          BETA
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
