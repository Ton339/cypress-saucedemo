describe('SauceDemo E2E Flow Test (Separated Steps)', { testIsolation: false }, () => {
    const baseUrl = 'https://www.saucedemo.com';

    // before() จะรันแค่ "ครั้งเดียว" ก่อนเริ่ม it() แรกสุด
    before(() => {
        cy.visit(baseUrl);
        cy.get('[data-test="username"]').type('standard_user');
        cy.get('[data-test="password"]').type('secret_sauce');
        cy.get('[data-test="login-button"]').click();
        cy.url().should('include', '/inventory.html');
    });

    // (Optional) ล้างข้อมูลทิ้งหลังจบรันครบทั้ง 5 Steps เพื่อไม่ให้กวนรอบถัดไป
    after(() => {
        cy.clearAllCookies();
        cy.clearAllLocalStorage();
        cy.clearAllSessionStorage();
    });

    // ---------------------------------------------------------
    // Case 1: การเรียงลำดับ
    // ---------------------------------------------------------
    it('1. Sorting Test: ควรเรียงลำดับสินค้าจาก Price (high to low) ได้ถูกต้อง', () => {
        cy.get('[data-test="product-sort-container"]').select('hilo');

        cy.get('.inventory_item_price').then(($prices) => {
            const priceList = $prices.map((_, el) => parseFloat(el.innerText.replace('$', ''))).get();
            // เช็กว่าชิ้นแรกแพงกว่าหรือเท่ากับชิ้นถัดไป
            expect(priceList[0]).to.be.at.least(priceList[1]);
        });
    });

    // ---------------------------------------------------------
    // Case 2: การเลือกสินค้า
    // ---------------------------------------------------------
    it('2. Multi-Item Selection: ควรเพิ่มสินค้าที่แพงที่สุดและถูกที่สุดลงตะกร้าได้', () => {
        // แอดชิ้นแรก (แพงสุด) และชิ้นสุดท้าย (ถูกสุด)
        cy.get('.inventory_item').first().find('button').click();
        cy.get('.inventory_item').last().find('button').click();

        // ตรวจสอบตัวเลข Badge ที่ตะกร้า
        cy.get('.shopping_cart_badge').should('have.text', '2');
    });

    // ---------------------------------------------------------
    // Case 3: ตรวจสอบตะกร้า
    // ---------------------------------------------------------
    it('3. Cart Navigation & Validation: ควรแสดงสินค้าในตะกร้า 2 ชิ้น', () => {
        cy.get('.shopping_cart_link').click();
        cy.location('pathname').should('eq', '/cart.html');
        cy.get('.cart_item').should('have.length', 2);
    });

    // ---------------------------------------------------------
    // Case 4: ชำระเงินและคำนวณราคา
    // ---------------------------------------------------------
    it('4. Checkout & Calculation: ควรคำนวณราคาสินค้ารวมภาษีได้ถูกต้อง', () => {
        cy.get('[data-test="checkout"]').click();

        // กรอกข้อมูล
        cy.get('[data-test="firstName"]').type('Sithachad');
        cy.get('[data-test="lastName"]').type('Dev');
        cy.get('[data-test="postalCode"]').type('10220');
        cy.get('[data-test="continue"]').click();

        // คำนวณและตรวจสอบตัวเลข
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

    // ---------------------------------------------------------
    // Case 5: เสร็จสิ้น
    // ---------------------------------------------------------
    it('5. Complete Verification: ควรแสดงหน้า Thank you เมื่อสั่งซื้อสำเร็จ', () => {
        cy.get('[data-test="finish"]').click();
        cy.url().should('eq', 'https://www.saucedemo.com/checkout-complete.html');
        cy.get('.complete-header').should('have.text', 'Thank you for your order!');
    });
});