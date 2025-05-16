
// Main application JavaScript for Budget Tracker

// DOM Elements
const balanceEl = document.getElementById('balance');
const incomeEl = document.getElementById('income-total');
const expenseEl = document.getElementById('expense-total');
const transactionForm = document.getElementById('transaction-form');
const transactionNameInput = document.getElementById('transaction-name');
const transactionAmountInput = document.getElementById('transaction-amount');
const transactionTypeSelect = document.getElementById('transaction-type');
const transactionCategorySelect = document.getElementById('transaction-category');
const transactionDateInput = document.getElementById('transaction-date');
const transactionList = document.getElementById('transaction-list');
const filterCategorySelect = document.getElementById('filter-category');
const filterTypeSelect = document.getElementById('filter-type');
const modal = document.getElementById('edit-modal');
const closeModal = document.querySelector('.close-modal');
const editForm = document.getElementById('edit-form');
const editIdInput = document.getElementById('edit-id');
const editNameInput = document.getElementById('edit-name');
const editAmountInput = document.getElementById('edit-amount');
const editTypeSelect = document.getElementById('edit-type');
const editCategorySelect = document.getElementById('edit-category');
const editDateInput = document.getElementById('edit-date');
const deleteBtn = document.getElementById('delete-transaction');

// Set current date as default for new transactions
const today = new Date().toISOString().split('T')[0];
transactionDateInput.value = today;

// Initialize app data
let transactions = getFromLocalStorage('transactions') || [];

// Initialize categories
function initCategories() {
  // Populate category selects (both new transaction and edit forms)
  [transactionCategorySelect, editCategorySelect, filterCategorySelect].forEach(select => {
    if (!select) return;
    
    // Clear existing options except the first one for filter select
    if (select === filterCategorySelect) {
      while (select.options.length > 1) {
        select.remove(1);
      }
    } else {
      select.innerHTML = '';
    }

    // Add categories based on transaction type
    const type = select === filterCategorySelect ? 'all' : 
                 select === transactionCategorySelect ? transactionTypeSelect.value : 
                 editTypeSelect.value;
    
    const relevantCategories = type === 'all' ? 
      categories.income.concat(categories.expense) : 
      categories[type] || [];
    
    relevantCategories.forEach(category => {
      const option = document.createElement('option');
      option.value = category.id;
      option.textContent = category.name;
      option.dataset.type = category.type;
      select.appendChild(option);
    });
  });
}

// Update UI with transaction data
function updateUI() {
  updateBalance();
  renderTransactionList();
}

// Update balance summary
function updateBalance() {
  const { totalIncome, totalExpense } = calculateTotals();
  const balance = totalIncome - totalExpense;

  balanceEl.textContent = formatCurrency(balance);
  incomeEl.textContent = formatCurrency(totalIncome);
  expenseEl.textContent = formatCurrency(totalExpense);
}

// Calculate income and expense totals
function calculateTotals() {
  return transactions.reduce((totals, transaction) => {
    if (transaction.type === 'income') {
      totals.totalIncome += parseFloat(transaction.amount);
    } else if (transaction.type === 'expense') {
      totals.totalExpense += parseFloat(transaction.amount);
    }
    return totals;
  }, { totalIncome: 0, totalExpense: 0 });
}

// Render transaction list
function renderTransactionList() {
  // Get filter values
  const categoryFilter = filterCategorySelect.value;
  const typeFilter = filterTypeSelect.value;

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesCategory = categoryFilter === 'all' || transaction.category === categoryFilter;
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    return matchesCategory && matchesType;
  });

  // Clear current list
  transactionList.innerHTML = '';

  if (filteredTransactions.length === 0) {
    const emptyState = document.createElement('p');
    emptyState.classList.add('empty-state');
    emptyState.textContent = 'No transactions found.';
    transactionList.appendChild(emptyState);
    return;
  }

  // Sort transactions by date (newest first)
  filteredTransactions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach(transaction => {
      const transactionItem = createTransactionElement(transaction);
      transactionList.appendChild(transactionItem);
    });
}

// Create transaction element
function createTransactionElement(transaction) {
  const transactionItem = document.createElement('div');
  transactionItem.classList.add('transaction-item');
  transactionItem.dataset.id = transaction.id;

  const category = getCategoryById(transaction.category, transaction.type);
  
  transactionItem.innerHTML = `
    <div class="transaction-info">
      <div class="transaction-name">${transaction.name}</div>
      <div class="transaction-details">
        <span class="transaction-category">${category ? category.name : 'Unknown'}</span>
        <span class="transaction-date">${formatDate(transaction.date)}</span>
      </div>
    </div>
    <div class="transaction-amount ${transaction.type === 'income' ? 'amount-income' : 'amount-expense'}">
      ${transaction.type === 'income' ? '+' : '-'} ${formatCurrency(transaction.amount)}
    </div>
  `;

  transactionItem.addEventListener('click', () => {
    openEditModal(transaction);
  });

  return transactionItem;
}

// Get category by ID
function getCategoryById(categoryId, type) {
  return categories[type].find(cat => cat.id === categoryId);
}

// Add new transaction
function addTransaction(e) {
  e.preventDefault();

  const transaction = {
    id: generateId(),
    name: transactionNameInput.value,
    amount: parseFloat(transactionAmountInput.value),
    type: transactionTypeSelect.value,
    category: transactionCategorySelect.value,
    date: transactionDateInput.value
  };

  transactions.push(transaction);
  saveToLocalStorage('transactions', transactions);
  updateUI();
  
  // Reset form
  transactionForm.reset();
  transactionDateInput.value = today;
  
  // Update categories based on default type
  transactionTypeSelect.value = 'income';
  initCategories();
}

// Edit transaction
function openEditModal(transaction) {
  editIdInput.value = transaction.id;
  editNameInput.value = transaction.name;
  editAmountInput.value = transaction.amount;
  editTypeSelect.value = transaction.type;
  editDateInput.value = transaction.date;
  
  // Update categories for the edit form based on transaction type
  initCategories();
  
  // Set selected category
  if (editCategorySelect.querySelector(`option[value="${transaction.category}"]`)) {
    editCategorySelect.value = transaction.category;
  }
  
  // Show modal
  modal.style.display = 'flex';
}

function updateTransaction(e) {
  e.preventDefault();
  
  const id = editIdInput.value;
  const transactionIndex = transactions.findIndex(t => t.id === id);
  
  if (transactionIndex !== -1) {
    transactions[transactionIndex] = {
      id,
      name: editNameInput.value,
      amount: parseFloat(editAmountInput.value),
      type: editTypeSelect.value,
      category: editCategorySelect.value,
      date: editDateInput.value
    };
    
    saveToLocalStorage('transactions', transactions);
    updateUI();
  }
  
  closeEditModal();
}

function deleteTransaction() {
  const id = editIdInput.value;
  transactions = transactions.filter(t => t.id !== id);
  saveToLocalStorage('transactions', transactions);
  updateUI();
  closeEditModal();
}

function closeEditModal() {
  modal.style.display = 'none';
}

// Event listeners
transactionForm.addEventListener('submit', addTransaction);
editForm.addEventListener('submit', updateTransaction);
deleteBtn.addEventListener('click', deleteTransaction);
closeModal.addEventListener('click', closeEditModal);
window.addEventListener('click', (e) => {
  if (e.target === modal) {
    closeEditModal();
  }
});

transactionTypeSelect.addEventListener('change', initCategories);
editTypeSelect.addEventListener('change', initCategories);
filterCategorySelect.addEventListener('change', renderTransactionList);
filterTypeSelect.addEventListener('change', renderTransactionList);

// Update filter options when type filter changes
filterTypeSelect.addEventListener('change', () => {
  const selectedType = filterTypeSelect.value;
  
  // Save current selection
  const currentCategoryValue = filterCategorySelect.value;
  
  // Clear options except All
  while (filterCategorySelect.options.length > 1) {
    filterCategorySelect.remove(1);
  }
  
  // Add categories based on type
  if (selectedType === 'all') {
    // Add all categories
    categories.income.concat(categories.expense).forEach(category => {
      const option = document.createElement('option');
      option.value = category.id;
      option.textContent = category.name;
      filterCategorySelect.appendChild(option);
    });
  } else {
    // Add categories for selected type
    categories[selectedType].forEach(category => {
      const option = document.createElement('option');
      option.value = category.id;
      option.textContent = category.name;
      filterCategorySelect.appendChild(option);
    });
  }
  
  // Try to restore previous selection if it exists in new options
  if (Array.from(filterCategorySelect.options).some(opt => opt.value === currentCategoryValue)) {
    filterCategorySelect.value = currentCategoryValue;
  } else {
    filterCategorySelect.value = 'all';
  }
  
  renderTransactionList();
});

// Initialize app
initCategories();
updateUI();
