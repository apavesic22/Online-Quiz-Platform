export interface User {
    id: number,
    username: string,
    password: string,
    roles: number[],
    total_score: number,
    rank: number
}