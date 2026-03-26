const Contact = () => {
  return (
    <div className="min-h-screen pt-24 px-4 max-w-2xl mx-auto pb-20">
      <h1 className="text-4xl font-bold text-center mb-6 horror-glow" style={{ fontFamily: 'Creepster, cursive' }}>
        Contact
      </h1>
      <div className="bg-card rounded-lg p-8 horror-border text-center">
        <p className="text-muted-foreground mb-3">For support, contact us at:</p>
        <a href="mailto:support@dzonyx.com" className="text-primary hover:underline text-xl font-medium">
          support@dzonyx.com
        </a>
      </div>
    </div>
  );
};

export default Contact;
