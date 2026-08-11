import Masthead from "@/components/Masthead";
import OneSlot from "@/components/OneSlot";
import Clippings from "@/components/Clippings";
import KeyboardSpecimen from "@/components/KeyboardSpecimen";
import Provenance from "@/components/Provenance";
import LicenseSection from "@/components/LicenseSection";
import Colophon from "@/components/Colophon";

/**
 * The specimen page.
 *
 * Plate order is the contract: masthead → the one-slot problem → the clippings →
 * the keyboard → provenance → the license → colophon. Every child is a default
 * export taking zero props, so this file stays a pure composition and the page
 * remains a server component (LCP is the masthead word, rendered as text).
 *
 * The LiveShelf is mounted once by the root layout, inside ShelfProvider — it is
 * deliberately NOT rendered here.
 */
export default function SpecimenPage() {
  return (
    <>
      <Masthead />
      <OneSlot />
      <Clippings />
      <KeyboardSpecimen />
      <Provenance />
      <LicenseSection />
      <Colophon />
    </>
  );
}
