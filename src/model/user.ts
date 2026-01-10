export interface User {
    id: number,
    username: string,
    password: string,
    roles: number[],
    email: string,
    total_score: number,
    rank: number
}