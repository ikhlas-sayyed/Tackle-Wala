import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  fullWidth?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, fullWidth = true, ...props }, ref) => {
    const widthClass = fullWidth ? 'w-full' : ''
    const errorClass = error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
    
    const inputClasses = `${widthClass} px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200 ${errorClass} ${className}`
    
    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label className="form-label">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={inputClasses}
          {...props}
        />
        {error && (
          <p className="form-error">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  fullWidth?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', label, error, fullWidth = true, ...props }, ref) => {
    const widthClass = fullWidth ? 'w-full' : ''
    const errorClass = error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
    
    const textareaClasses = `${widthClass} px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200 resize-vertical min-h-[100px] ${errorClass} ${className}`
    
    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label className="form-label">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={textareaClasses}
          {...props}
        />
        {error && (
          <p className="form-error">{error}</p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
