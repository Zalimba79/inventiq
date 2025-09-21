// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock webcam for testing
jest.mock('react-webcam', () => ({
  __esModule: true,
  default: jest.fn(({ onUserMedia, screenshotFormat, videoConstraints, className }) => {
    // Simulate camera initialization
    setTimeout(() => {
      onUserMedia?.()
    }, 100)
    
    return (
      <div 
        data-testid="mock-webcam"
        className={className}
        data-facing-mode={videoConstraints?.facingMode}
      >
        Mock Webcam
      </div>
    )
  })
}))

// Mock navigator.mediaDevices for camera permissions
Object.defineProperty(window.navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: jest.fn().mockImplementation(() => 
      Promise.resolve({
        getTracks: () => [{
          stop: jest.fn()
        }]
      })
    ),
    enumerateDevices: jest.fn().mockImplementation(() =>
      Promise.resolve([
        { kind: 'videoinput', label: 'Front Camera', deviceId: 'front' },
        { kind: 'videoinput', label: 'Back Camera', deviceId: 'back' }
      ])
    )
  }
})

// Mock window.URL.createObjectURL
window.URL.createObjectURL = jest.fn(() => 'mock-blob-url')
window.URL.revokeObjectURL = jest.fn()

// Mock atob for base64 decoding in tests
global.atob = (str) => Buffer.from(str, 'base64').toString('binary')

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords() {
    return []
  }
}