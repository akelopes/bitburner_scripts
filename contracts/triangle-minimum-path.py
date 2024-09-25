def min_path_calculator(triangle):
    for i in range(len(triangle) - 2, -1, -1):
        for j in range(len(triangle[i])):
            triangle[i][j] += min(triangle[i + 1][j], triangle[i + 1][j + 1])
    return triangle[0][0]


if __name__ == "__main__":
    t = [
        [9],
        [9, 9],
        [2, 1, 1],
        [5, 4, 4, 6],
        [4, 1, 3, 4, 9],
        [5, 8, 7, 3, 6, 9],
        [7, 3, 8, 2, 9, 2, 8],
        [4, 8, 6, 9, 6, 1, 7, 5],
        [9, 7, 8, 4, 1, 7, 7, 8, 6],
        [7, 8, 4, 7, 2, 6, 6, 2, 2, 5],
        [8, 6, 8, 8, 8, 2, 3, 7, 7, 9, 4],
    ]
    print(min_path_calculator(t))
