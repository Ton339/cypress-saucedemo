# 🛒 SauceDemo Cypress E2E Testing

โปรเจกต์นี้เป็นการทดสอบระบบ End-to-End (E2E) แบบอัตโนมัติสำหรับเว็บไซต์ [SauceDemo](https://www.saucedemo.com/) โดยใช้เครื่องมือ **Cypress** เวอร์ชัน 16.1.0 

การทดสอบนี้จำลองพฤติกรรมผู้ใช้ตั้งแต่การล็อกอิน การเรียงลำดับสินค้า การเลือกสินค้า การตรวจสอบตะกร้า และการชำระเงินจนเสร็จสมบูรณ์ โดยแบ่งการทดสอบออกเป็น 5 ขั้นตอนย่อยเพื่อให้ง่ายต่อการตรวจสอบข้อผิดพลาด (Debug)

---

## 📋 สิ่งที่ต้องมี (Prerequisites)
- **Node.js** (แนะนำเวอร์ชัน 22.x หรือ 24.x ขึ้นไป) - [ดาวน์โหลด Node.js](https://nodejs.org/)
- **Visual Studio Code (VS Code)** หรือ Code Editor อื่นๆ

---

## 🚀 วิธีการตั้งค่าโปรเจกต์ (Setup Steps & CLI)

เปิด Terminal (หรือ Command Prompt / PowerShell) แล้วทำตามขั้นตอนต่อไปนี้ตามลำดับ:

### 1. สร้างและเข้าไปที่โฟลเดอร์โปรเจกต์
```bash
mkdir cypress-saucedemo
cd cypress-saucedemo

```

### 2. เริ่มต้นโปรเจกต์ Node.js

คำสั่งนี้จะสร้างไฟล์ `package.json` ขึ้นมา

```bash
npm init -y

```

### 3. ติดตั้ง Cypress เวอร์ชัน 16.1.0

ติดตั้ง Cypress เป็น Dev Dependency

```bash
npm install cypress@16.1.0 --save-dev

```

### 4. เปิด Cypress ครั้งแรกเพื่อสร้างโครงสร้างไฟล์

```bash
npx cypress open

```

* **ขั้นตอนในหน้าจอ UI:**
1. เลือก **E2E Testing**
2. กด **Continue** (Cypress จะสร้างไฟล์ `cypress.config.js` และโฟลเดอร์ `cypress/` ให้)
3. เลือกเบราว์เซอร์ (เช่น Chrome) แล้วกด **Start E2E Testing**
4. ปิดหน้าต่าง Cypress ไปก่อนเพื่อไปเขียนโค้ด



---

## 📂 โครงสร้างโฟลเดอร์ที่สำคัญ

หลังจาก Setup เสร็จสิ้น ให้เข้าไปสร้างไฟล์ทดสอบที่ `cypress/e2e/`

```text
cypress-saucedemo/
├── cypress/
│   ├── e2e/
│   │   └── saucedemo.cy.js   <-- ไฟล์ที่เราจะเขียนโค้ดทดสอบ
│   ├── fixtures/
│   └── support/
├── node_modules/
├── cypress.config.js
├── package.json
└── package-lock.json

```

---

## 💻 การเขียนโค้ด (Writing the Code)

สร้างไฟล์ชื่อ `saucedemo.cy.js` ไว้ในโฟลเดอร์ `cypress/e2e/` และวางโค้ดด้านล่างนี้:

```javascript
describe('SauceDemo E2E Flow Test (Separated Steps)', { testIsolation: false }, () => {
  const baseUrl = '[https://www.saucedemo.com](https://www.saucedemo.com)';

  // ทำงานครั้งเดียว "ก่อน" เริ่ม Test Case แรกสุด
  before(() => {
    cy.visit(baseUrl);
    cy.get('[data-test="username"]').type('standard_user');
    cy.get('[data-test="password"]').type('secret_sauce');
    cy.get('[data-test="login-button"]').click();
    cy.url().should('include', '/inventory.html');
  });

  // ทำงานครั้งเดียว "หลัง" จากรัน Test Case ครบทั้งหมด
  after(() => {
    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();
  });

  it('1. Sorting Test: ควรเรียงลำดับสินค้าจาก Price (high to low) ได้ถูกต้อง', () => {
    cy.get('[data-test="product-sort-container"]').select('hilo');
    cy.get('.inventory_item_price').then(($prices) => {
      const priceList = $prices.map((_, el) => parseFloat(el.innerText.replace('$', ''))).get();
      expect(priceList[0]).to.be.at.least(priceList[1]);
    });
  });

  it('2. Multi-Item Selection: ควรเพิ่มสินค้าที่แพงที่สุดและถูกที่สุดลงตะกร้าได้', () => {
    cy.get('.inventory_item').first().find('button').click();
    cy.get('.inventory_item').last().find('button').click();
    cy.get('.shopping_cart_badge').should('have.text', '2');
  });

  it('3. Cart Navigation & Validation: ควรแสดงสินค้าในตะกร้า 2 ชิ้น', () => {
    cy.get('.shopping_cart_link').click();
    cy.location('pathname').should('eq', '/cart.html');
    cy.get('.cart_item').should('have.length', 2);
  });

  it('4. Checkout & Calculation: ควรคำนวณราคาสินค้ารวมภาษีได้ถูกต้อง', () => {
    cy.get('[data-test="checkout"]').click();
    cy.get('[data-test="firstName"]').type('Sithachad');
    cy.get('[data-test="lastName"]').type('Dev');
    cy.get('[data-test="postalCode"]').type('10220');
    cy.get('[data-test="continue"]').click();

    cy.get('.inventory_item_price').then(($itemPrices) => {
      const actualSum = $itemPrices
        .map((_, el) => parseFloat(el.innerText.replace('$', '')))
        .get()
        .reduce((sum, price) => sum + price, 0);

      cy.get('.summary_subtotal_label').invoke('text').then((subtotalText) => {
        const itemTotal = parseFloat(subtotalText.replace('Item total: $', ''));
        expect(itemTotal).to.equal(actualSum);

        const expectedTax = parseFloat((itemTotal * 0.08).toFixed(2));
        cy.get('.summary_tax_label').invoke('text').then((taxText) => {
          const displayedTax = parseFloat(taxText.replace('Tax: $', ''));
          expect(displayedTax).to.equal(expectedTax);

          cy.get('.summary_total_label').invoke('text').then((totalText) => {
            const displayedTotal = parseFloat(totalText.replace('Total: $', ''));
            const expectedTotal = parseFloat((itemTotal + displayedTax).toFixed(2));
            expect(displayedTotal).to.equal(expectedTotal);
          });
        });
      });
    });
  });

  it('5. Complete Verification: ควรแสดงหน้า Thank you เมื่อสั่งซื้อสำเร็จ', () => {
    cy.get('[data-test="finish"]').click();
    cy.url().should('eq', '[https://www.saucedemo.com/checkout-complete.html](https://www.saucedemo.com/checkout-complete.html)');
    cy.get('.complete-header').should('have.text', 'Thank you for your order!');
  });
});

```

---

## 🧠 อธิบายการทำงานของโค้ด

1. **`{ testIsolation: false }`**:
ปกติ Cypress จะล้างหน้าเว็บ ล้างคุกกี้ และรีเฟรชหน้าใหม่ทุกครั้งที่ขึ้น `it()` ใหม่ การใส่ค่านี้บอก Cypress ว่า **"ไม่ต้องล้างหน้าจอ"** เพื่อให้การทำงานส่งต่อกันเป็นทอดๆ (เช่น ของที่อยู่ในตะกร้าจากข้อ 2 จะยังคงอยู่ในข้อ 3)
2. **`before()`**:
เป็น Hook ที่จะรัน **"เพียงครั้งเดียว"** ก่อนที่จะเริ่มทำ `it()` ข้อแรก ใช้สำหรับ Login ทิ้งไว้
3. **`after()`**:
เป็น Hook ที่จะรันเมื่อทำ `it()` ครบทุกข้อแล้ว ใช้เพื่อล้าง Cache/Cookies ให้สะอาด พร้อมสำหรับการรันรอบใหม่
4. **`it('...', () => { ... })`**:
แต่ละ `it` คือ 1 Test Case หากโค้ดพังหรือหาปุ่มไม่เจอ Cypress จะแจ้งเตือนที่ข้อนั้นๆ ทำให้เรารู้ได้ทันทีว่าระบบพังที่ Step ไหน (ดีกว่ารวมทุกอย่างไว้ใน `it` เดียว)

---

## 🏃‍♂️ วิธีรันการทดสอบ (How to Run)

สามารถรันได้ 2 รูปแบบผ่าน Terminal:

### 1. รันแบบ Interactive Mode (ดูการทำงานผ่าน UI)

เหมาะสำหรับการเขียนโค้ดและ Debug จะมีเบราว์เซอร์เปิดขึ้นมาให้เห็นการทำงานทีละสเตป

```bash
npx cypress open

```

> กดเลือก `E2E Testing` > เลือกเบราว์เซอร์ (Chrome) > กดคลิกที่ไฟล์ `saucedemo.cy.js`

### 2. รันแบบ Headless Mode (รันเบื้องหลัง)

เหมาะสำหรับการนำไปรันบน CI/CD (เช่น GitHub Actions) จะไม่มีหน้าต่างเด้งขึ้นมา แต่จะสรุปผลลัพธ์ผ่าน Terminal

```bash
npx cypress run --spec "cypress/e2e/saucedemo.cy.js"

```