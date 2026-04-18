const sessions = {}

export async function handleMessage(user, text) {
  if (!sessions[user]) {
    sessions[user] = { step: 'START' }
  }

  const session = sessions[user]

  if (text === 'hi' || text === 'start') {
    session.step = 'MENU'
    return send(user, `1️⃣ Products\n2️⃣ Orders\n3️⃣ Support`)
  }

  if (session.step === 'MENU' && text === '1') {
    session.step = 'CATEGORY'
    return send(user, `Choose category:\n1. Electronics\n2. Fashion`)
  }

  if (session.step === 'CATEGORY' && text === '1') {
    session.step = 'PRODUCTS'
    return send(user, `1. iPhone 13\n2. Samsung S22`)
  }

  if (session.step === 'PRODUCTS' && text === '1') {
    session.step = 'CONFIRM'
    return send(user, `iPhone 13 selected. Type YES to confirm order`)
  }

  if (session.step === 'CONFIRM' && text.toLowerCase() === 'yes') {
    session.step = 'DONE'
    return send(user, `Order placed! 🎉`)
  }
}