import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PhotoCapture } from '../PhotoCapture'
import { useCaptureStore } from '@/store/capture-store'

// Mock the store
jest.mock('@/store/capture-store')

// Mock the CameraView component
jest.mock('../CameraView', () => ({
  CameraView: ({ onCapture, className }: any) => (
    <div data-testid="camera-view" className={className}>
      <button onClick={() => onCapture('data:image/jpeg;base64,testimage')}>
        Capture Photo
      </button>
    </div>
  )
}))

// Mock the PhotoPreview component
jest.mock('../PhotoPreview', () => ({
  PhotoPreview: ({ photos, className }: any) => (
    <div data-testid="photo-preview" className={className}>
      {photos.length} photos
    </div>
  )
}))

// Mock the toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn()
  })
}))

describe('PhotoCapture', () => {
  const mockStartSession = jest.fn()
  const mockAddPhoto = jest.fn()
  const mockEndSession = jest.fn()
  const mockOnComplete = jest.fn()

  const mockSession = {
    id: 'test-session',
    photos: [],
    startTime: new Date(),
    status: 'active' as const
  }

  beforeEach(() => {
    jest.clearAllMocks();
    (useCaptureStore as unknown as jest.Mock).mockReturnValue({
      currentSession: mockSession,
      startSession: mockStartSession,
      addPhoto: mockAddPhoto,
      endSession: mockEndSession
    })
  })

  it('renders photo capture interface', () => {
    render(<PhotoCapture />)
    
    expect(screen.getByText('Product Photo Capture')).toBeInTheDocument()
    expect(screen.getByTestId('camera-view')).toBeInTheDocument()
    expect(screen.getByText('0 photos')).toBeInTheDocument()
  })

  it('starts a new session on mount if none exists', () => {
    (useCaptureStore as unknown as jest.Mock).mockReturnValue({
      currentSession: null,
      startSession: mockStartSession,
      addPhoto: mockAddPhoto,
      endSession: mockEndSession
    })

    render(<PhotoCapture />)
    
    expect(mockStartSession).toHaveBeenCalled()
  })

  it('captures photo and adds to session', () => {
    render(<PhotoCapture />)
    
    const captureButton = screen.getByText('Capture Photo')
    fireEvent.click(captureButton)

    expect(mockAddPhoto).toHaveBeenCalledWith(
      expect.objectContaining({
        dataUrl: 'data:image/jpeg;base64,testimage',
        mimeType: 'image/jpeg'
      })
    )
  })

  it('displays photo count correctly', () => {
    const sessionWithPhotos = {
      ...mockSession,
      photos: [
        { id: '1', dataUrl: 'test1', timestamp: new Date(), fileName: 'photo1.jpg', size: 1000, mimeType: 'image/jpeg' },
        { id: '2', dataUrl: 'test2', timestamp: new Date(), fileName: 'photo2.jpg', size: 1000, mimeType: 'image/jpeg' }
      ]
    };

    (useCaptureStore as unknown as jest.Mock).mockReturnValue({
      currentSession: sessionWithPhotos,
      startSession: mockStartSession,
      addPhoto: mockAddPhoto,
      endSession: mockEndSession
    })

    render(<PhotoCapture />)
    
    expect(screen.getByText('2 photos')).toBeInTheDocument()
  })

  it('completes session when complete button is clicked', () => {
    const sessionWithPhotos = {
      ...mockSession,
      photos: [
        { id: '1', dataUrl: 'test1', timestamp: new Date(), fileName: 'photo1.jpg', size: 1000, mimeType: 'image/jpeg' }
      ]
    };

    (useCaptureStore as unknown as jest.Mock).mockReturnValue({
      currentSession: sessionWithPhotos,
      startSession: mockStartSession,
      addPhoto: mockAddPhoto,
      endSession: mockEndSession
    })

    render(<PhotoCapture onComplete={mockOnComplete} />)
    
    const completeButton = screen.getByRole('button', { name: /complete/i })
    fireEvent.click(completeButton)

    expect(mockEndSession).toHaveBeenCalled()
    expect(mockOnComplete).toHaveBeenCalled()
  })

  it('disables complete button when no photos captured', () => {
    render(<PhotoCapture />)
    
    const completeButton = screen.getByRole('button', { name: /complete/i })
    expect(completeButton).toBeDisabled()
  })

  it('shows photo preview strip when photos exist', () => {
    const sessionWithPhotos = {
      ...mockSession,
      photos: [
        { id: '1', dataUrl: 'test1', timestamp: new Date(), fileName: 'photo1.jpg', size: 1000, mimeType: 'image/jpeg' }
      ]
    };

    (useCaptureStore as unknown as jest.Mock).mockReturnValue({
      currentSession: sessionWithPhotos,
      startSession: mockStartSession,
      addPhoto: mockAddPhoto,
      endSession: mockEndSession
    })

    render(<PhotoCapture />)
    
    expect(screen.getByTestId('photo-preview')).toBeInTheDocument()
  })

  it('briefly shows success message after capture', async () => {
    jest.useFakeTimers()
    
    render(<PhotoCapture />)
    
    const captureButton = screen.getByText('Capture Photo')
    fireEvent.click(captureButton)

    // Should show success message
    expect(screen.getByText('Photo saved!')).toBeInTheDocument()

    // Fast forward time
    jest.advanceTimersByTime(600)

    await waitFor(() => {
      expect(screen.getByTestId('camera-view')).toBeInTheDocument()
    })

    jest.useRealTimers()
  })

  it('applies custom className', () => {
    const { container } = render(<PhotoCapture className="custom-class" />)
    
    const captureContainer = container.querySelector('.custom-class')
    expect(captureContainer).toBeInTheDocument()
  })
})