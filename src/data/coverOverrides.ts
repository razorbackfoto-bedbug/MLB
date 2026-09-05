// Temporary cover-image overrides for books that were missing or had unreliable thumbnails.
// These URLs are keyed by the existing book slug so books.json does not need a large rewrite.
// The Open Library Covers API uses ISBNs to return the matching cover when available.

export const coverOverrides: Record<string, string> = {
  'franklin-goes-to-the-hospital': 'https://covers.openlibrary.org/b/isbn/1554537258-L.jpg',
  'curious-george-goes-to-the-hospital': 'https://covers.openlibrary.org/b/isbn/0395070627-L.jpg',
  'the-berenstain-bears-hospital-friends': 'https://covers.openlibrary.org/b/isbn/0062075411-L.jpg',
  'little-critter-my-trip-to-the-hospital': 'https://covers.openlibrary.org/b/isbn/0060539496-L.jpg',
  'cooper-gets-a-ct-scan': 'https://covers.openlibrary.org/b/isbn/0939838877-L.jpg',
  'tubes-in-my-ears': 'https://covers.openlibrary.org/b/isbn/1572551186-L.jpg',
  'do-i-have-to-go-to-the-hospital': 'https://covers.openlibrary.org/b/isbn/0340894512-L.jpg',
  'my-first-hospital-visit': 'https://covers.openlibrary.org/b/isbn/179390622X-L.jpg',
  'a-visit-to-the-sesame-street-hospital': 'https://covers.openlibrary.org/b/isbn/039487062X-L.jpg',
  'eves-ekg-and-echocardiogram': 'https://covers.openlibrary.org/b/isbn/1986195074-L.jpg',
  'how-will-they-get-that-heart-down-your-throat': 'https://covers.openlibrary.org/b/isbn/1880664992-L.jpg',
  'kat-alex-and-the-amazing-lemonade-stand': 'https://covers.openlibrary.org/b/isbn/0975320009-L.jpg',
  'sammy-hits-a-home-run': 'https://covers.openlibrary.org/b/isbn/1458204219-L.jpg',
  'will-jax-be-home-for-thanksgiving': 'https://covers.openlibrary.org/b/isbn/1735680923-L.jpg',
  'sometimes-rebecca-elliott': 'https://covers.openlibrary.org/b/isbn/0745962971-L.jpg',
  'what-about-me-when-brothers-and-sisters-get-sick': 'https://covers.openlibrary.org/b/isbn/0945354495-L.jpg',
  'when-molly-was-in-the-hospital': 'https://covers.openlibrary.org/b/isbn/1877810444-L.jpg',
  'just-because-rebecca-elliott': 'https://covers.openlibrary.org/b/isbn/0745962351-L.jpg',
  'lifetimes-a-beautiful-way-to-explain-death-to-children': 'https://covers.openlibrary.org/b/isbn/0553344021-L.jpg',
  'a-boy-and-a-bear': 'https://covers.openlibrary.org/b/isbn/1886941076-L.jpg',
  'imagine-a-rainbow': 'https://covers.openlibrary.org/b/isbn/1591473853-L.jpg',
  'breathe-like-a-bear': 'https://covers.openlibrary.org/b/isbn/1623368839-L.jpg',
  'sea-otter-cove': 'https://covers.openlibrary.org/b/isbn/1937985083-L.jpg',
  'i-am-a-vip-very-important-patient': 'https://covers.openlibrary.org/b/isbn/1631103741-L.jpg',
  'a-terrible-thing-happened': 'https://covers.openlibrary.org/b/isbn/1557987017-L.jpg',
  'the-kissing-hand': 'https://covers.openlibrary.org/b/isbn/1939100429-L.jpg',
  'howie-helps-himself': 'https://covers.openlibrary.org/b/isbn/0807534226-L.jpg',
};
