# 🏗️ โครงสร้างการเขียน Test และคำสั่งสำคัญใน Cypress

เอกสารนี้รวบรวมโครงสร้างในการจัดระเบียบชุดทดสอบ (Test Suite) และคำสั่งที่ใช้งานบ่อย (Key Commands) ใน Cypress พร้อมตัวอย่างโค้ด เพื่อให้ง่ายต่อการทบทวนและนำไปใช้งานจริง

---

## 1. โครงสร้างของ Test (Test Structure)

Cypress ใช้โครงสร้างของ Mocha (Testing Framework) ในการจัดระเบียบโค้ด โดยมีบล็อกคำสั่งหลักๆ ดังนี้:

### บล็อกพื้นฐานและ ฮุก (Hooks)
* **`describe` / `context`**: จัดกลุ่ม Test Cases
* **`it`**: 1 Test Case ย่อย
* **`before` / `beforeEach` / `after` / `afterEach`**: ควบคุมการทำงานก่อน-หลัง Test

**ตัวอย่างโค้ดโครงสร้าง:**
```javascript
describe('ระบบ Login (Test Suite)', () => {

  before(() => {
    // ทำงาน "ครั้งเดียว" ก่อนเริ่ม Test Case (it) ตัวแรก
    // นิยมใช้จำลองข้อมูล (Mock Data) หรือตั้งค่าเริ่มต้น
    cy.log('เริ่มต้นการทดสอบระบบ Login');
  });

  beforeEach(() => {
    // ทำงาน "ทุกครั้ง" ก่อนเริ่มแต่ละ Test Case
    // นิยมใช้เปิดหน้าเว็บ หรือเคลียร์ State
    cy.visit('https://www.example.com/login');
  });

  afterEach(() => {
    // ทำงาน "ทุกครั้ง" หลังจบแต่ละ Test Case
    cy.log('จบ 1 เคส');
  });

  after(() => {
    // ทำงาน "ครั้งเดียว" เมื่อทำ Test Case ครบทุกข้อแล้ว
    // นิยมใช้ล้างข้อมูล หรือลบ Cookies
    cy.clearAllCookies();
  });

  // ----------------------------------------------------

  it('ควรเข้าสู่ระบบสำเร็จเมื่อกรอกข้อมูลถูกต้อง', () => {
    cy.get('#username').type('user1');
    cy.get('#password').type('pass1234');
    cy.get('#btn-login').click();
    cy.url().should('include', '/dashboard');
  });

  it('ควรแสดงข้อความแจ้งเตือนเมื่อรหัสผ่านผิด', () => {
    cy.get('#username').type('user1');
    cy.get('#password').type('wrongpass');
    cy.get('#btn-login').click();
    cy.get('.error-message').should('be.visible').and('have.text', 'Invalid password');
  });

});
```

### การตั้งค่า Test Isolation (สำหรับ E2E Flow)
ตั้งแต่ Cypress v12 เป็นต้นมา ระบบจะล้างสถานะหน้าเว็บ (Test Isolation) ทุกครั้งที่ขึ้น `it()` ใหม่ หากต้องการรันเคสแบบต่อเนื่อง (เช่น ของยังอยู่ในตะกร้าข้ามไปยังอีก `it` นึง) ให้ใส่ค่านี้:
```javascript
describe('E2E Flow Test', { testIsolation: false }, () => { 
  // โค้ดทดสอบ... 
});
```

---

## 2. คำสั่งสำคัญที่ใช้บ่อย (Key Commands)

### 🌐 การนำทางและการเข้าถึง URL (Navigation)
* **`cy.visit('url')`**: สั่งให้เบราว์เซอร์เปิดหน้าเว็บตาม URL
* **`cy.url()`**: ดึงค่า URL ของหน้าปัจจุบัน
* **`cy.location('pathname')`**: ดึงค่าเฉพาะ Path ของ URL ปัจจุบัน

**ตัวอย่าง:**
```javascript
cy.visit('https://www.saucedemo.com/cart.html');
cy.url().should('eq', 'https://www.saucedemo.com/cart.html');
cy.location('pathname').should('eq', '/cart.html');
```

### 🔍 การค้นหา Element (Querying)
* **`cy.get('selector')`**: ค้นหาตาม CSS Selector (`.class`, `#id`, `[attr="value"]`)
* **`cy.find('selector')`**: ค้นหา Element ย่อย
* **`cy.first()` / `cy.last()`**: เลือกตัวแรกสุด / ตัวสุดท้าย
* **`cy.eq(index)`**: เลือกตามลำดับ (Index เริ่มที่ 0)

**ตัวอย่าง:**
```javascript
// หา div.cart-list แล้วหาลูกที่เป็น .item ตัวแรก
cy.get('.cart-list').find('.item').first().click();

// หาปุ่มในหน้าจอทั้งหมด แล้วเลือกปุ่มลำดับที่ 3 (index 2)
cy.get('button').eq(2).click(); 
```

### 🖱️ การโต้ตอบกับหน้าเว็บ (Interactions)
* **`.click()`**: คลิก
* **`.type('text')`**: พิมพ์ข้อความ (รองรับคีย์บอร์ดเช่น `{enter}`, `{esc}`)
* **`.clear()`**: ลบข้อความในช่อง Input
* **`.select('value')`**: เลือกตัวเลือกจาก Dropdown (`<select>`)
* **`.check()` / `.uncheck()`**: ติ๊ก Checkbox / Radio

**ตัวอย่าง:**
```javascript
// พิมพ์ > ลบที่พิมพ์ > พิมพ์ใหม่พร้อมกด Enter
cy.get('#search').type('Cypress').clear().type('Testing{enter}');

// เลือก Dropdown (เลือกตาม value หรือ text ก็ได้)
cy.get('.product-sort').select('Price (low to high)');

// ติ๊กยอมรับเงื่อนไข
cy.get('#terms-checkbox').check();
```

### ✅ การตรวจสอบผลลัพธ์ (Assertions)
* **`.should('have.text', 'text')`**: ข้อความต้องตรงเป๊ะ
* **`.should('include.text', 'text')`**: มีข้อความนี้ประกอบอยู่
* **`.should('be.visible')`**: แสดงอยู่บนหน้าจอจริง
* **`.should('have.length', number)`**: ตรวจสอบจำนวน Element
* **`.should('have.attr', 'name', 'value')`**: ตรวจสอบ Attribute

**ตัวอย่าง:**
```javascript
// ใช้ .and() เชื่อม Assertions หลายๆ ข้อได้
cy.get('.badge').should('be.visible').and('have.text', '3');

// ตรวจสอบว่ามีสินค้าในตะกร้า 5 ชิ้น
cy.get('.cart-item').should('have.length', 5);

// ตรวจสอบลิงก์
cy.get('a.home-link').should('have.attr', 'href', '/home');
```

### ⚙️ การดึงข้อมูลมาใช้งาน (Yielding & Variables)
เนื่องจาก Cypress ทำงานแบบ Asynchronous เราไม่สามารถประกาศตัวแปรรับค่าตรงๆ ได้ ต้องใช้ `.then()` หรือ `.invoke()`

**ตัวอย่างการดึงข้อความมาคำนวณ:**
```javascript
// ดึงข้อความมาโดยตรงด้วย invoke
cy.get('.total-price').invoke('text').then((text) => {
  const price = parseFloat(text.replace('Total: $', ''));
  expect(price).to.be.greaterThan(100); // BDD Assertion
});

// ดึงแบบ JQuery Element ($el) เพื่อหาค่าหลายตัว
cy.get('.item-price').then(($prices) => {
  const firstPrice = parseFloat($prices[0].innerText.replace('$', ''));
  const secondPrice = parseFloat($prices[1].innerText.replace('$', ''));
  expect(firstPrice).to.equal(secondPrice);
});
```