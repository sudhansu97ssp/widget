import { screen } from '@testing-library/react'
import React from 'react'
import { App } from './App'
import { renderWithProviders } from './utils/test-utils'

describe("App", () => {
    test("Powered by text", () => {
        renderWithProviders(<App />)
        let element = screen.getByText(/Powered by Troopod/i)
        expect(element).toBeInTheDocument()
        expect(element).toBeVisible()
    })
    test('Troopod Logo alt text', async () => {
        renderWithProviders(<App />);
        const logo = screen.getByAltText('troopod_logo');
        expect(logo).toHaveAttribute('alt', 'troopod_logo');
        expect(logo).toBeVisible()
    });
})