describe('timing-provider-server', () => {
    it('should not export anything', async () => {
        const app = await import('../../build/node/app.js');

        expect(Object.keys(app)).to.deep.equal([]);
    });
});
