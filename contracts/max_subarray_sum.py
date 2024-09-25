def max_subarray_sum(array):
    window_sum = max_sum = array[0]
    
    for n in array[1:]:
        window_sum = max(n, window_sum + n)
        max_sum = max(max_sum, window_sum)
        
    return max_sum

if __name__ == '__main__':
    a = [-10,-8,-2,0,-6,1,3,6,-7,1,-6,0,7,0,10,-7,-1,-10,-4,-6,-2,8,7,8,0,1,-2,-9,3,6,-7,5,10,-6,-7,-5,-8,8,5,9]
    print(max_subarray_sum(a))
        