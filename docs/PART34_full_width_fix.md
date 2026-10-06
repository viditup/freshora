# PART 34 - full width fix (Part 33 + 34 ek zip mein)
Problem (Part 33 on phone): card minHeight + text se lamba ho jata tha, picture `cover` se zoom/crop hoti thi -> right ka note, Order Now pill kinare par kat jate the,
Offers mein photo text ke neeche aa jati thi.
Fix: har card ki height ab picture ke exact ratio se (aspectRatio) + resizeMode stretch = poori picture, 1:1, kuch nahi katta. Text/buttons absolute overlay
(card ko lamba nahi kar sakte). Offers text har line alag, free left area tak limited, shrink hota hai (photo par nahi chadhta).
Ratios: strip 4.962, offers 1.436, kitchen 3.302, festival 4.246, green 5.496, fresh 3.799, membership 3.043, learn 476:175.
Notes har banner ke alag hain (PDF ke asli picture se): Kitchen/Membership "Good Food Happier You", Festival "Traditions Bring Us Closer",
Fresh "Eat Good Live Better", Green "Small Choices Big Change".
Part 33 ke saare changes (images, Personal Care filler) included.
Phone par verify nahi hua: text size/overlap.
