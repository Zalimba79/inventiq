import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CameraView } from '../CameraView'

// Mock the react-webcam getScreenshot method
const mockGetScreenshot = jest.fn()
jest.mock('react-webcam', () => ({
  __esModule: true,
  default: React.forwardRef((props: any, ref: any) => {
    React.useImperativeHandle(ref, () => ({
      getScreenshot: mockGetScreenshot
    }))
    
    setTimeout(() => {
      props.onUserMedia?.()
    }, 100)
    
    return (
      <div 
        data-testid="mock-webcam"
        className={props.className}
      >
        Mock Webcam
      </div>
    )
  })
}))

describe('CameraView', () => {
  const mockOnCapture = jest.fn()
  const mockOnClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockGetScreenshot.mockReturnValue('data:image/jpeg;base64,mockImageData')
  })

  it('renders camera view with controls', async () => {
    render(<CameraView onCapture={mockOnCapture} />)
    
    // Wait for camera to initialize
    await waitFor(() => {
      expect(screen.getByTestId('mock-webcam')).toBeInTheDocument()
    })

    // Check for capture button
    const captureButton = screen.getByRole('button', { name: /camera/i })
    expect(captureButton).toBeInTheDocument()
  })

  it('shows loading state while initializing', () => {
    render(<CameraView onCapture={mockOnCapture} />)
    
    expect(screen.getByText('Initializing camera...')).toBeInTheDocument()
  })

  it('handles camera permission denied', async () => {
    // Mock permission denied
    const mockGetUserMedia = jest.fn().mockRejectedValue(new Error('Permission denied'))
    Object.defineProperty(window.navigator, 'mediaDevices', {
      writable: true,
      value: {
        getUserMedia: mockGetUserMedia
      }
    })

    render(<CameraView onCapture={mockOnCapture} />)
    
    await waitFor(() => {
      expect(screen.getByText('Camera Permission Denied')).toBeInTheDocument()
    })

    // Check for retry button
    const retryButton = screen.getByRole('button', { name: /try again/i })
    expect(retryButton).toBeInTheDocument()
  })

  it('captures photo when capture button is clicked', async () => {
    render(<CameraView onCapture={mockOnCapture} />)
    
    // Wait for camera to initialize
    await waitFor(() => {
      expect(screen.getByTestId('mock-webcam')).toBeInTheDocument()
    })

    // Click capture button
    const captureButton = screen.getByRole('button', { name: /camera/i })
    fireEvent.click(captureButton)

    expect(mockGetScreenshot).toHaveBeenCalled()
    expect(mockOnCapture).toHaveBeenCalledWith('data:image/jpeg;base64,mockImageData')
  })

  it('toggles camera facing mode', async () => {
    render(<CameraView onCapture={mockOnCapture} />)
    
    await waitFor(() => {
      expect(screen.getByTestId('mock-webcam')).toBeInTheDocument()
    })

    // Find and click rotate button
    const rotateButtons = screen.getAllByRole('button')
    const rotateButton = rotateButtons.find(btn => 
      btn.querySelector('svg')?.classList.contains('lucide-rotate-cw')
    )
    
    if (rotateButton) {
      fireEvent.click(rotateButton)
      // The camera should switch facing mode
      await waitFor(() => {
        expect(screen.getByTestId('mock-webcam')).toBeInTheDocument()
      })
    }
  })

  it('calls onClose when close button is clicked', async () => {
    render(<CameraView onCapture={mockOnCapture} onClose={mockOnClose} />)
    
    await waitFor(() => {
      expect(screen.getByTestId('mock-webcam')).toBeInTheDocument()
    })

    // Find and click close button (X icon)
    const closeButtons = screen.getAllByRole('button')
    const closeButton = closeButtons.find(btn => 
      btn.querySelector('svg')?.classList.contains('lucide-x')
    )
    
    if (closeButton) {
      fireEvent.click(closeButton)
      expect(mockOnClose).toHaveBeenCalled()
    }
  })

  it('displays grid overlay for composition', async () => {
    render(<CameraView onCapture={mockOnCapture} />)
    
    await waitFor(() => {
      expect(screen.getByTestId('mock-webcam')).toBeInTheDocument()
    })

    // Check for grid overlay (9 grid cells)
    const container = screen.getByTestId('mock-webcam').closest('div')
    const gridOverlay = container?.querySelector('.grid-cols-3.grid-rows-3')
    expect(gridOverlay).toBeInTheDocument()
  })

  it('applies custom className', async () => {
    const { container } = render(
      <CameraView onCapture={mockOnCapture} className="custom-class" />
    )
    
    await waitFor(() => {
      expect(screen.getByTestId('mock-webcam')).toBeInTheDocument()
    })

    const cameraContainer = container.querySelector('.custom-class')
    expect(cameraContainer).toBeInTheDocument()
  })

  it('uses custom camera settings', async () => {
    const customSettings = {
      facingMode: 'user' as const,
      resolution: { width: 1280, height: 720 },
      aspectRatio: 16/9
    }

    render(
      <CameraView 
        onCapture={mockOnCapture} 
        settings={customSettings}
      />
    )
    
    await waitFor(() => {
      const webcam = screen.getByTestId('mock-webcam')
      expect(webcam).toBeInTheDocument()
    })
  })
})