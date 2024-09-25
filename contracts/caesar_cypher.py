def caesar_cypher(text, shift):
    result = []
    for char in text:
        if char.isalpha():
            # Calculates the position from A with ord(), then subtracts the shift and wrap it to the number of alphabet characters with % 26
            # Finally, adds to ord('A') to get the final character
            shifted = chr(((ord(char) - ord('A') - shift) % 26) + ord('A'))
            result.append(shifted)
        else:
            result.append(char)
    
    return ''.join(result)

if __name__ == '__main__':
    t = 'DEBUG MACRO EMAIL CACHE TRASH'
    s = 19
    
    print(caesar_cypher(t, s))