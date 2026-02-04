import { LoginForm } from '@/components/forms/login-form'

export default function LoginPage() {
  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">AR Portal</h1>
        <p className="mt-2 text-sm text-gray-600">
          Authorized Representative Services Portal
        </p>
      </div>
      <LoginForm />
    </div>
  )
}
