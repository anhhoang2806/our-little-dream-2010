/**
 * All personalised words and character looks live here, so they can be edited
 * without touching animation or layout code.
 *
 * ⚠️ `final.greeting` is the main greeting and must stay exactly as written.
 */

export const content = {
  meta: {
    shareTitle: 'Our Little Dream ❤️',
    shareText: 'Có một món quà nhỏ dành riêng cho em 💌',
  },

  opening: {
    title: 'Có một món quà nhỏ dành riêng cho em 💌',
    subtitle: 'Nhà mình, hoa và những giấc mơ nhỏ',
    cta: 'Chạm để mở nhé ❤️',
  },

  garden: {
    message: [
      'Em biết không?',
      'Mỗi lần em chạm vào đây, một bông hoa lại nở.',
      'Cũng giống như cách em làm cho cuộc sống của bố con anh trở nên đẹp hơn mỗi ngày. 🌸',
    ],
    hint: 'Chạm, hoặc vuốt khắp màn hình nhé',
    secret: 'Bố con anh yêu mẹ rất nhiều! ❤️',
    next: 'Xem điều đặc biệt tiếp theo ✨',
    /** Number of flower interactions before the secret heart appears. */
    secretThreshold: 10,
  },

  family: {
    message: [
      'Nhà mình chẳng cần điều gì quá lớn lao.',
      'Chỉ cần có em, có Chít, và thật nhiều ngày bình yên bên nhau. ❤️',
    ],
    hint: 'Chạm vào cả nhà nhé 💞',
    next: 'Nhà mình còn một ước mơ nhỏ... 🚗',
  },

  mazda: {
    message: [
      'Và rồi một ngày nào đó...',
      'Nhà mình sẽ có một chiếc Mazda 2 nhỏ xinh 🚗',
      'Để bố chở mẹ và Chít đi thật nhiều nơi, cùng nhau tạo thêm thật nhiều kỷ niệm.',
    ],
    caption: 'Ước mơ nhỏ của nhà mình ✨',
    hint: 'Chạm vào xe thử xem 🚗',
    next: 'Và điều cuối cùng bố con anh muốn nói... ❤️',
  },

  final: {
    /** MUST BE PRESERVED EXACTLY. */
    greeting: 'Chúc vợ yêu ngày 20/10 vui vẻ, hạnh phúc bên chồng và Chít!',
    /** The part of the greeting that receives the warm glow. */
    highlight: 'chồng và Chít',
    message: [
      'Cảm ơn em vì đã luôn yêu thương và chăm sóc bố con anh.',
      'Có em và Chít là điều hạnh phúc nhất của anh.',
      'Mong rằng nhà mình sẽ luôn có thật nhiều tiếng cười, những chuyến đi vui vẻ và những giấc mơ dần trở thành hiện thực.',
      'Yêu em rất nhiều! ❤️',
    ],
    signature: '— Chồng và Chít',
    date: '20 · 10',
    actions: {
      replay: 'Xem lại từ đầu 🌸',
      save: 'Lưu thiệp kỷ niệm 💌',
      share: 'Chia sẻ món quà ❤️',
    },
    saveHint: 'Nhấn giữ vào ảnh để lưu vào máy nhé',
    saveDownload: 'Tải ảnh xuống',
    saving: 'Đang vẽ thiệp...',
    copied: 'Đã sao chép đường link 💌',
    close: 'Đóng',
  },

  print: {
    lines: ['Một món quà nhỏ dành riêng cho vợ yêu ❤️', 'Quét mã để mở nhé!'],
    signature: '— Chồng và Chít',
  },

  audio: {
    on: 'Bật nhạc',
    off: 'Tắt nhạc',
  },
} as const

/**
 * Character looks, drawn from the family photo used as reference.
 * Everyone wears glasses; tweak colours here if needed.
 */
export const family = {
  husband: {
    skin: '#f0c9a8',
    skinShade: '#dfa985',
    hair: '#1f1a1c',
    glasses: '#1d1a1f',
    shirt: '#e6dcd2',
    shirtShade: '#cdbfb2',
    shorts: '#2c2c33',
    shoes: '#e8e0d0',
  },
  wife: {
    skin: '#f7d9c4',
    skinShade: '#e8b99e',
    hair: '#6a4030',
    hairLight: '#9a6646',
    glasses: '#241c1e',
    shirt: '#3a3337',
    shirtShade: '#2a2428',
    pants: '#545866',
    socks: '#3b4a6b',
    shoes: '#e8e0d0',
    lips: '#e48a8e',
  },
  chit: {
    skin: '#f3cfb3',
    skinShade: '#e2b08f',
    hair: '#1c1719',
    glasses: '#b9c3cc',
    shirt: '#fbfaf7',
    shirtShade: '#e6e2db',
    shorts: '#a8c4dc',
    shoes: '#2f3f6e',
    shoeAccent: '#f08a4b',
  },
} as const
