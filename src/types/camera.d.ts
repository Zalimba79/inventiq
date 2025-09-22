// Extended MediaTrackCapabilities for experimental camera features
export interface ExtendedMediaTrackCapabilities extends MediaTrackCapabilities {
  brightness?: MediaSettingsRange
  contrast?: MediaSettingsRange
  saturation?: MediaSettingsRange
  sharpness?: MediaSettingsRange
  focusDistance?: MediaSettingsRange
  focusMode?: string[]
  exposureMode?: string[]
  exposureCompensation?: MediaSettingsRange
  exposureTime?: MediaSettingsRange
  iso?: MediaSettingsRange
  whiteBalanceMode?: string[]
  colorTemperature?: MediaSettingsRange
  zoom?: MediaSettingsRange
  // Logitech Brio specific PTZ controls
  pan?: MediaSettingsRange
  tilt?: MediaSettingsRange
  // Field of View control (90°, 78°, 65° for Brio)
  fieldOfView?: MediaSettingsRange
}

export interface ExtendedMediaTrackConstraints extends MediaTrackConstraints {
  brightness?: ConstrainDouble
  contrast?: ConstrainDouble
  saturation?: ConstrainDouble
  sharpness?: ConstrainDouble
  focusDistance?: ConstrainDouble
  focusMode?: ConstrainDOMString
  exposureMode?: ConstrainDOMString
  exposureCompensation?: ConstrainDouble
  exposureTime?: ConstrainDouble
  iso?: ConstrainDouble
  whiteBalanceMode?: ConstrainDOMString
  colorTemperature?: ConstrainDouble
  zoom?: ConstrainDouble
  // Logitech Brio specific PTZ controls
  pan?: ConstrainDouble
  tilt?: ConstrainDouble
  // Field of View control
  fieldOfView?: ConstrainDouble
}

export interface ExtendedMediaTrackSettings extends MediaTrackSettings {
  brightness?: number
  contrast?: number
  saturation?: number
  sharpness?: number
  focusDistance?: number
  focusMode?: string
  exposureMode?: string
  exposureCompensation?: number
  exposureTime?: number
  iso?: number
  whiteBalanceMode?: string
  colorTemperature?: number
  zoom?: number
  // Logitech Brio specific PTZ controls
  pan?: number
  tilt?: number
  // Field of View control
  fieldOfView?: number
}

export interface MediaSettingsRange {
  max: number
  min: number
  step?: number
}