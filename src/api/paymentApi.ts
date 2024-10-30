// ... (previous code remains)

// Convert currency to tokens
router.post('/convert-to-tokens', authMiddleware, [
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { amount } = req.body;
  const userId = req.userId;

  try {
    const conversionRate = await getTokenConversionRate();
    const tokenAmount = await convertToTokens(userId, amount, conversionRate);
    res.json({ message: 'Conversion successful', tokenAmount });
  } catch (error) {
    res.status(500).json({ message: 'Server error during conversion' });
  }
});

// Convert tokens to currency
router.post('/convert-to-currency', authMiddleware, [
  body('tokenAmount').isInt({ min: 1 }).withMessage('Token amount must be a positive integer'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { tokenAmount } = req.body;
  const userId = req.userId;

  try {
    const conversionRate = await getTokenConversionRate();
    const currencyAmount = await convertToCurrency(userId, tokenAmount, conversionRate);
    res.json({ message: 'Conversion successful', currencyAmount });
  } catch (error) {
    res.status(500).json({ message: 'Server error during conversion' });
  }
});

// ... (rest of the code remains)