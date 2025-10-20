export type RegisterInput = {
  username: string
  email: string
  password: string
}

export type ActivateInput = {
  token: string
}

export type LoginInput = {
  email: string
  password: string
}

export type LoginResponse = {
  token: string
}
