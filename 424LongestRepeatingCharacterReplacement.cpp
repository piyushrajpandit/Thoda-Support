class Solution {
public:
    int characterReplacement(string s, int k) {
        int left = 0 ;
        int right = 0;
        int ans = 0;
        vector<int> count(26,0);
     
        int maxFreq = 0;
       while(right < s.size()){
            count[s[right] - 'A']++;
          
                maxFreq = max(maxFreq, count[s[right] -'A']);
            
            if((right-left +1)- maxFreq<= k){
                ans = max(ans, right- left+1);
                
                
            }
            else{
                count[s[left]-'A']--;
                left++;
            }
            right++;
       }

       return ans;
    }
};
